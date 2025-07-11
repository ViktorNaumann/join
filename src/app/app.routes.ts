import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import { SummaryComponent } from './summary/summary.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { BoardComponent } from './board/board.component';
import { LoginComponent } from './login-signup/login/login.component';
import { SignupComponent } from './login-signup/signup/signup.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    {path: 'summary', component: SummaryComponent},
    {path: 'add-task', component: AddTaskComponent},
    {path: 'board', component: BoardComponent},
    {path: 'contacts', component: ContactsComponent}
];
