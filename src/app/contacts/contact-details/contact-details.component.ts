import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { ContactService, Contact } from '../../services/contact.service';
import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',

  animations: [
    trigger('slideInFromRight', [
      // Add an initial state for elements entering the DOM
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(0%)', opacity: 1 })
        ),
      ]),
      // Keep the increment transition for subsequent changes
      transition(':increment', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(0%)', opacity: 1 })
        ),
      ]),
    ]),

    // NEU: Animation für mobile menu
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
export class ContactDetailsComponent implements OnInit, OnDestroy {
  contactVisible = false;
  contact?: Contact;
  animationState = 0; // Trigger für Animation
  isDeleting = false;
  isEditing = false;
  // NEU: Mobile menu properties
  menuOpen = false;
  isMobile = window.innerWidth < 768;
  private subscription?: Subscription;
  private firstLoad = true; // Add this flag

  @Output() backToList = new EventEmitter<void>();
  @Output() noContactVisible = new EventEmitter<void>();

  constructor(
    private contactService: ContactService,
    private elementRef: ElementRef
  ) {}

  // NEU: HostListener für Document-Clicks
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const mobileMenu =
      this.elementRef.nativeElement.querySelector('.mobile-menu');
    const mobileOptions = this.elementRef.nativeElement.querySelector(
      '.mobile-options-btn'
    );

    // Prüfen ob das Click-Target innerhalb des Mobile-Menus oder Mobile-Options ist
    if (
      this.menuOpen &&
      !mobileMenu?.contains(target) &&
      !mobileOptions?.contains(target)
    ) {
      this.menuOpen = false;
    }
  }

  // NEU: HostListener für Resize-Events
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const width = (event.target as Window).innerWidth;
    this.isMobile = width < 781;
    if (!this.isMobile && this.menuOpen) {
      this.menuOpen = false;
    }
  }

  // NEU: Toggle Menu Funktion
  toggleMobileMenu() {
    if (this.isMobile) {
      this.menuOpen = !this.menuOpen;
    }
  }

  // Getter für Template - kombiniert beide Flags
  get isAnimationDisabled(): boolean {
    return this.isDeleting || this.isEditing;
  }

  ngOnInit(): void {
    // Kombiniere selectedContact$ und getContacts() um immer aktuelle Daten zu haben
    this.subscription = combineLatest([
      this.contactService.selectedContact$,
      this.contactService.getContacts(),
    ])
      .pipe(
        map(([selectedContact, allContacts]) => {
          if (!selectedContact) return null;
          // Finde den aktuellen Kontakt in der Liste aller Kontakte
          return (
            allContacts.find((contact) => contact.id === selectedContact.id) ||
            selectedContact
          );
        })
      )

      .subscribe({
        next: (contact) => {
          const wasEmpty = !this.contact;
          const isContactChange = contact && contact !== this.contact;

          // Update contact data but don't show it yet
          this.contact = contact || undefined;

          // Reset flags
          if (!contact) {
            this.isDeleting = false;
            this.isEditing = false;
            this.contactVisible = false;

            // NEU: Event emittieren wenn kein Kontakt angezeigt wird
            setTimeout(() => {
              this.noContactVisible.emit();
            }, 100);
          } else if (isContactChange) {
            // Reset editing flag when changing contacts
            this.isEditing = false;

            if (
              !this.isDeleting &&
              (this.firstLoad || wasEmpty || isContactChange)
            ) {
              // Important: Keep element hidden until animation is ready
              this.contactVisible = false;

              // Short timeout to ensure the DOM has time to process the visibility change
              setTimeout(() => {
                // Now make it visible and trigger the animation
                this.contactVisible = true;
                this.animationState++;
                this.firstLoad = false;
              }, 10);
            }
          }
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onEditContact(): void {
    if (this.contact) {
      this.isEditing = true;
      this.contactService.showEditForm(this.contact); //NEU
      this.menuOpen = false; // NEU: Menu schließen nach Aktion
    }
  }

  onDeleteContact(): void {
    if (this.contact?.id) {
      this.isDeleting = true;
      this.menuOpen = false; // NEU: Menu schließen nach Aktion
      this.contactService.deleteContact(this.contact.id);
      this.contactService.clearSelection(); // Auswahl nach dem Löschen zurücksetzen
    }
  }

  getInitials(name?: string): string {
    return this.contactService.getInitials(name);
  }

  // Avatar-Farbe aus dem Service
  getContactColor(name?: string): string {
    if (!name) return '#9E9E9E'; // Fallback-Farbe für leere Namen
    return this.contactService.getContactColor(name);
  }

  // Schließen über den Pfeil
  closeContactDetails(): void {
    this.contactVisible = false;
  }

  onBackToList() {
    this.backToList.emit();
  }
}
