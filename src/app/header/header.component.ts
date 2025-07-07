import { Component, HostListener } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '200ms ease-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms ease-in',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class HeaderComponent {
  menuOpen = false;
  isMobile = window.innerWidth < 1000;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    this.isMobile = width < 1000;
    if (!this.isMobile && this.menuOpen) {
      this.menuOpen = false;
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
