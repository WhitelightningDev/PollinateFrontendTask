import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, distinctUntilChanged, map, Observable, shareReplay } from 'rxjs';
import { NewTodoInput, Todo } from '../models/todo.model';
import { TodosService } from '../services/todos.service';

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

interface TodosStoreState {
  status: LoadState;
  error: string | null;
  fetched: Todo[];
  added: Todo[];
  updated: Todo[];
  deleted: number[]; // store IDs of deleted todos
}

@Injectable({
  providedIn: 'root',
})
export class TodosStore {
  private readonly todosService = inject(TodosService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly stateSubject = new BehaviorSubject<TodosStoreState>({
    status: 'idle',
    error: null,
    fetched: [],
    added: [],
    updated: [],
    deleted: [],
  });

  private readonly state$ = this.stateSubject.asObservable().pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly status$: Observable<LoadState> = this.select((state) => state.status);
  readonly error$: Observable<string | null> = this.select((state) => state.error);

  readonly todos$: Observable<Todo[]> = this.state$.pipe(
    map((state) => {
      const updatedMap = new Map(state.updated.map((todo) => [todo.id, todo] as const));
      const deletedSet = new Set(state.deleted);

      const fetched = state.fetched
        .filter((todo) => !deletedSet.has(todo.id))
        .map((todo) => updatedMap.get(todo.id) ?? todo);

      const added = state.added.filter((todo) => !deletedSet.has(todo.id));

      return [...fetched, ...added];
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  loadTodos(): void {
    const { status, fetched } = this.stateSubject.value;
    if (status === 'loading') return;
    if (status === 'loaded' && fetched.length > 0) return;

    this.setState({ status: 'loading', error: null });
    this.todosService
      .getTodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (todos) => this.setState({ fetched: todos, status: 'loaded' }),
        error: (error: unknown) =>
          this.setState({ status: 'error', error: toErrorMessage(error) }),
      });
  }

  todosForUser$(userId: number): Observable<Todo[]> {
    return this.todos$.pipe(map((todos) => todos.filter((todo) => todo.userId === userId)));
  }

  addTodo(input: NewTodoInput): void {
    this.setState({ error: null });
    this.todosService
      .createTodo(input)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newTodo) => {
          const { added } = this.stateSubject.value;
          this.setState({ added: [...added, newTodo] });
        },
        error: (error: unknown) =>
          this.setState({ status: 'error', error: toErrorMessage(error) }),
      });
  }

  updateTodo(id: number, updates: Partial<Todo>): void {
    const current = this.getTodoSnapshot(id);
    if (!current) {
      this.setState({ status: 'error', error: `Todo ${id} not found` });
      return;
    }

    const nextTodo: Todo = { ...current, ...updates, id: current.id };
    this.setState({ error: null });

    this.todosService
      .updateTodo(id, nextTodo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedTodo) => {
          const currentUpdated = this.stateSubject.value.updated.filter((todo) => todo.id !== id);
          this.setState({ updated: [...currentUpdated, updatedTodo] });
        },
        error: (error: unknown) =>
          this.setState({ status: 'error', error: toErrorMessage(error) }),
      });
  }

  deleteTodo(id: number): void {
    this.setState({ error: null });
    this.todosService
      .deleteTodo(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const { deleted, added, updated } = this.stateSubject.value;
          if (deleted.includes(id)) return;
          this.setState({
            deleted: [...deleted, id],
            added: added.filter((t) => t.id !== id),
            updated: updated.filter((t) => t.id !== id),
          });
        },
        error: (error: unknown) =>
          this.setState({ status: 'error', error: toErrorMessage(error) }),
      });
  }

  private select<T>(selector: (state: TodosStoreState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  private setState(partialState: Partial<TodosStoreState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  private getTodoSnapshot(id: number): Todo | undefined {
    const state = this.stateSubject.value;
    if (state.deleted.includes(id)) return undefined;

    const fromUpdated = state.updated.find((t) => t.id === id);
    if (fromUpdated) return fromUpdated;

    const fromAdded = state.added.find((t) => t.id === id);
    if (fromAdded) return fromAdded;

    return state.fetched.find((t) => t.id === id);
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
}
