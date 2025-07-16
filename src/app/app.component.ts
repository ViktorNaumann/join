/**
 * The root component of the application.
 * 
 * It manages global layout elements such as the header and sidebar,
 * and determines their visibility based on the current route.
 * Also initializes the NavigationHistoryService for tracking navigation state.
 */

import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { CommonModule } from '@angular/common';
import { NavigationHistoryService } from './services/navigation-history.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {

  /**
   * Controls whether the header and sidebar should be displayed.
   * Hidden on specific routes like login or signup.
   */
  showHeaderAndSidebar = true;

  /**
   * The title of the application.
   */
  title = 'join';

  /**
   * Subscribes to router events to determine if the current route
   * requires hiding the header and sidebar. Also initializes navigation tracking.
   *
   * @param navigationService - Service to store navigation history.
   * @param router - Angular's router for subscribing to route changes.
   */
  constructor(
    private navigationService: NavigationHistoryService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showHeaderAndSidebar = !['/login', '/', '/signup'].includes(
          event.urlAfterRedirects
        );
      });
  }
}

