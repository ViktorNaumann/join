import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { ContactService, Contact } from '../services/contact.service';
import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-contact-details',
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
  ],
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  contactVisible = false; //NEU
  contact?: Contact;
  animationState = 0; // Trigger für Animation
  isDeleting = false;
  isEditing = false;
  private subscription?: Subscription;
  private firstLoad = true; // NEU - Add this flag

  @Output() backToList = new EventEmitter<void>();

  // NEU - Getter für Template - kombiniert beide Flags
  get isAnimationDisabled(): boolean {
    return this.isDeleting || this.isEditing;
  }

  constructor(private contactService: ContactService) {}

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
    }
  }

  onDeleteContact(): void {
    if (this.contact?.id) {
      this.isDeleting = true;
      this.contactService.deleteContact(this.contact.id);
      this.contactService.clearSelection(); // Auswahl nach dem Löschen zurücksetzen
    }
  }

  // getInitials(name?: string): string {
  //   if (!name) return 'NN';
  //   return name
  //     .split(' ')
  //     .map((n) => n[0])
  //     .join('')
  //     .toUpperCase();
  // }

  getInitials(name?: string): string {
    return this.contactService.getInitials(name);
  }

  // NEU - Avatar-Farbe aus dem Service
  getContactColor(name?: string): string {
    if (!name) return '#9E9E9E'; // Fallback-Farbe für leere Namen
    return this.contactService.getContactColor(name);
  }

  //NEU Schließen über den Pfeil
  closeContactDetails(): void {
    this.contactVisible = false;
    // this.contactService.clearSelection();
}

onBackToList() {
    this.backToList.emit();
  }
}
