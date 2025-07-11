import { Routes } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import { SummaryComponent } from './summary/summary.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { BoardComponent } from './board/board.component';
import { HelpComponent } from './shared/help/help.component';
import { LegalNoticeComponent } from './shared/legal-notice/legal-notice.component';
import { PrivacyPolicyComponent } from './shared/privacy-policy/privacy-policy.component';

export const routes: Routes = [
    {path: 'summary', component: SummaryComponent},
    {path: 'add-task', component: AddTaskComponent},
    {path: 'board', component: BoardComponent},
    {path: 'contacts', component: ContactsComponent},
    {path: 'help', component: HelpComponent},
    {path: 'legal-notice', component: LegalNoticeComponent},
    {path: 'privacy-policy', component: PrivacyPolicyComponent},
];
