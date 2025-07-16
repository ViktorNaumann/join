import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

/**
 * Sidebar-Komponente für die Navigation der Anwendung.
 * Zeigt Navigationslinks und überprüft den Authentifizierungsstatus des Benutzers.
 */
@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  /**
   * Konstruktor der SidebarComponent.
   * @param authService - Service zur Verwaltung der Benutzerauthentifizierung
   */
  constructor(private authService: AuthService) {}

  /**
   * Überprüft, ob der Benutzer eingeloggt ist.
   * @returns True, wenn der Benutzer authentifiziert ist, andernfalls false
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
