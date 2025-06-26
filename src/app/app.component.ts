import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactDetailsComponent } from './contact-details/contact-details.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { ContactService, Contact } from './services/contact.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationEvent,
} from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ContactListComponent,
    ContactDetailsComponent,
    ContactFormComponent,
    CommonModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  //NEU Richtung der Animation abhängig vom Viewport
  animations: [
    trigger('slideInOut', [
      // ENTER: void => right
      transition('void => right', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      // LEAVE: right => void
      transition('right => void', [
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),

      // ENTER: void => bottom
      transition('void => bottom', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      // LEAVE: bottom => void
      transition('bottom => void', [
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateY(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'join';
  animationDirection: 'right' | 'bottom' = 'right';
  toastMessageVisible = false;
  toastAnimationState: 'right' | 'bottom' | 'void' = 'void';
  backgroundVisible = false;
  // Observable für die Formular-Sichtbarkeit
  showForm$: Observable<boolean>;

  // Neue Variable für Mobile-Navigation
  showContactDetails = false;

  constructor(private contactService: ContactService) {
    this.showForm$ = this.contactService.showForm$;
  }

  ngOnInit() {
    // Initiale Richtung bestimmen
    this.setAnimationDirection(window.innerWidth);
    // Auf Fenstergröße reagieren
    window.addEventListener('resize', () => {
      this.setAnimationDirection(window.innerWidth);
    });
  }

  onContactAdded(newContact: Contact) {
    this.contactService.selectContact(newContact);
    this.onContactSelected();
    this.startMessageAnimation();
  }

  setAnimationDirection(width: number) {
    this.animationDirection = width < 1000 ? 'bottom' : 'right';
  }

  startMessageAnimation() {
    this.toastAnimationState = this.animationDirection;
    this.toastMessageVisible = true;

    setTimeout(() => {
      this.toastMessageVisible = false;
      this.toastAnimationState = 'void'; // Für Animation "leave"
    }, 3000);
  }

  removeBackground(event: string) {
    if (event === 'closed') {
      this.backgroundVisible = false;
    }
  }

  onOverlayAnimationDone(event: AnimationEvent) {
    if (event.toState === 'right' || event.toState === 'bottom') {
      setTimeout(() => {
        this.backgroundVisible = true;
      }, 50);
    }
  }

  // Methode zum Zurücknavigieren zur Liste
  onBackToList() {
    this.showContactDetails = false;
  }
  // Methode die aufgerufen wird, wenn ein Kontakt ausgewählt wird
  onContactSelected() {
    this.showContactDetails = true;
  }

  // NEU: Methode für automatisches Zurückkehren zur Liste
  onNoContactVisible() {
    // Nur in mobiler Ansicht automatisch zur Liste zurückkehren
    if (window.innerWidth < 768) {
      this.showContactDetails = false;
    }
  }
}
