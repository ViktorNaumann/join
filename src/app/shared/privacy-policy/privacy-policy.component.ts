/**
 * Component representing the Privacy Policy page.
 * 
 * Provides a simple way to display privacy-related information and 
 * allows the user to navigate back to the previous page using the 
 * NavigationHistoryService.
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationHistoryService } from '../../services/navigation-history.service';

@Component({
  selector: 'app-privacy-policy',
  imports: [RouterModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})

export class PrivacyPolicyComponent {

  /**
   * Creates an instance of PrivacyPolicyComponent.
   *
   * @param navigationService - A service used to handle navigation history and go back to the previous route.
   */
  constructor(private navigationService: NavigationHistoryService) {}

  /**
   * Navigates back to the previous route using the NavigationHistoryService.
   */
  goBack(): void {
    this.navigationService.navigateBack();
  }
}
