import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Route guard that prevents access to certain routes
 * unless the user is authenticated.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  /**
   * Constructs the AuthGuard.
   * @param authService - Service to check the user's authentication status
   * @param router - Angular Router used for navigation
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Determines whether a route can be activated.
   * If the user is not authenticated, redirects to the login page.
   *
   * @returns True if the user is logged in, otherwise false
   */
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
