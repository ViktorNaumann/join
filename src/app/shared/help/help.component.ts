import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavigationHistoryService } from '../../services/navigation-history.service';


@Component({
  selector: 'app-help',
  imports: [
    RouterModule
  ],
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss'
})
export class HelpComponent {
  constructor(private navigationService: NavigationHistoryService) {}

   goBack() {
    this.navigationService.navigateBack();
    console.log(this.navigationService.getHistory())
  }

}
