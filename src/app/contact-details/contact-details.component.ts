import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
      state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
      state('*', style({ transform: 'translateX(0%)', opacity: 1 })),
      transition('void => *', [
        animate('250ms ease-in-out')
      ]),
      transition('* => void', [
        animate('250ms ease-in-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
  ],
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  contact?: Contact;
  animationState = 0; // Trigger für Animation
  isDeleting = false;
  isEditing = false;
  private subscription?: Subscription;

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
          // Animation nur bei echtem Kontaktwechsel (nicht beim Löschen/Editieren)
          if (
            !this.isDeleting &&
            !this.isEditing &&
            contact &&
            contact !== this.contact
          ) {
            this.animationState++;
          }

          this.contact = contact || undefined;

          // Flags zurücksetzen
          if (!contact) {
            this.isDeleting = false;
            this.isEditing = false;
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

}
