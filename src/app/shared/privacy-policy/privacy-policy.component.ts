import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationHistoryService } from '../../services/navigation-history.service';

@Component({
  selector: 'app-privacy-policy',
  imports: [
    RouterModule
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  constructor(private navigationService: NavigationHistoryService) {}
  
     goBack() {
      this.navigationService.navigateBack();
    }
  
}
