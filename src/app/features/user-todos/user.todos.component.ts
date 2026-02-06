import { DestroyRef, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';

import { UsersService } from '../../core/services/users.service';
import { TodosStore } from '../../core/state/todos.store';
import { User } from '../../core/models/user.model';
import { Todo } from '../../core/models/todo.model';

@Component({
  selector: 'app-user-todos',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './user.todos.component.html',
})
export class UserTodosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(UsersService);
  private readonly todosStore = inject(TodosStore);
  private readonly fb = inject(FormBuilder);

  readonly userId = signal<number | null>(null);

  readonly userLoading = signal(false);
  readonly userError = signal<string | null>(null);
  readonly user = signal<User | null>(null);

  readonly todosStatus$ = this.todosStore.status$;
  readonly todosError$ = this.todosStore.error$;
  readonly todos = signal<Todo[]>([]);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    completed: [false],
  });

  ngOnInit(): void {
    // Load todos once (store will guard multiple loads)
    this.todosStore.loadTodos();

    // React to route changes
    const userId$ = this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      filter((id) => Number.isFinite(id) && id > 0),
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    userId$
      .pipe(
        tap((id) => {
          this.userId.set(id);
          this.user.set(null);
          this.userError.set(null);
          this.userLoading.set(true);

          this.form.reset({ title: '', completed: false });
        }),
        switchMap((id) =>
          this.usersApi.getUserById(id).pipe(
            catchError((err) => {
              const message =
                err instanceof Error
                  ? err.message
                  : typeof err?.message === 'string'
                    ? err.message
                    : 'Failed to load user';
              this.userError.set(message);
              return of(null);
            }),
            tap(() => this.userLoading.set(false)),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((user) => {
        this.user.set(user);
        if (!user && !this.userError()) {
          this.userError.set('User not found');
        }
      });

    // Keep todos list in sync for the current userId
    userId$
      .pipe(
        switchMap((id) => this.todosStore.todosForUser$(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((todos) => this.todos.set(todos));
  }

  addTodo(): void {
    const id = this.userId();
    if (!id) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, completed } = this.form.getRawValue();

    this.todosStore.addTodo({
      userId: id,
      title: title.trim(),
      completed,
    });

    this.form.reset({ title: '', completed: false });
  }

  trackByTodoId(_: number, todo: Todo): number {
    return todo.id;
  }
}
