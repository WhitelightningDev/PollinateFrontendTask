import { DestroyRef, Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { catchError, finalize, of } from 'rxjs';

import { UsersService } from "../../core/services/users.service";
import { User } from "../../core/models/user.model";

@Component({
    selector: "app-users-list",
    imports: [CommonModule, RouterLink],
    standalone: true,
    templateUrl: "./users-list.component.html",
})
export class UsersListComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly usersService = inject(UsersService);

    readonly users = signal<User[]>([]);
    readonly isLoading = signal(false);
    readonly error = signal<string | null>(null);

    ngOnInit(): void {
        this.fetchUsers();
    }

    public fetchUsers(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.usersService
            .getUsers()
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                catchError(err => {
                    const message =
                        err instanceof Error
                            ? err.message
                            : typeof err?.message === 'string'
                              ? err.message
                              : "An error occurred while fetching users.";
                    this.error.set(message);
                    return of([] as User[]);
                }),
                finalize(() => {
                    this.isLoading.set(false);
                })
            )
            .subscribe((users: User[]) => {
                this.users.set(users);
            });
    }
}
