import { Routes } from '@angular/router';
import { UsersListComponent } from './features/users/users-list.component';

export const routes: Routes = [
     { path: '', pathMatch: 'full', redirectTo: 'users' },
     { path: 'users', component: UsersListComponent},

     { path: '**', redirectTo: 'users' },
];
