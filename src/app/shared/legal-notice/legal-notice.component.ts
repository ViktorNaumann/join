/**
 * Component representing the Legal Notice (Impressum) page.
 * 
 * Displays legal information required for the application and 
 * provides a button to navigate back to the previous route 
 * using the NavigationHistoryService.
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationHistoryService } from '../../services/navigation-history.service';

@Component({
  selector: 'app-legal-notice',
  imports: [RouterModule],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.scss'
})
export class LegalNoticeComponent {

  /**
   * Creates an instance of LegalNoticeComponent.
   *
   * @param navigationService - Service used to navigate back in the routing history.
   */
  constructor(private navigationService: NavigationHistoryService) {}

  /**
   * Navigates back to the previous route using the NavigationHistoryService.
   */
  goBack(): void {
    this.navigationService.navigateBack();
  }

}
