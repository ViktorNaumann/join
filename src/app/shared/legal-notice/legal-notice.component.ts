import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationHistoryService } from '../../services/navigation-history.service';

@Component({
  selector: 'app-legal-notice',
  imports: [
    RouterModule
  ],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {
  constructor(private navigationService: NavigationHistoryService) {}

   goBack() {
    this.navigationService.navigateBack();
    console.log(this.navigationService.getHistory())
  }

}
