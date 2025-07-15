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
  showHeaderAndSidebar = true;

  constructor(
    private navigationService: NavigationHistoryService,
    private router: Router
  ) {
    // Überwache Route-Änderungen
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Verstecke Header und Sidebar für Login- und Signup-Seiten
        this.showHeaderAndSidebar = !['/login', '/', '/signup'].includes(
          event.urlAfterRedirects
        );
      });
  }

  title = 'join';
}
