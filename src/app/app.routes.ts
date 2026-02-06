import { Routes } from '@angular/router';
import { UsersListComponent } from './features/users/users-list.component';
import { UserTodosComponent } from './features/user-todos/user.todos.component';

export const routes: Routes = [
     { path: '', pathMatch: 'full', redirectTo: 'users' },
     { path: 'users', component: UsersListComponent},
     { path: 'users/:id', component: UserTodosComponent },
     { path: '**', redirectTo: 'users' },
];
