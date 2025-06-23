import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactService, Contact } from '../services/contact.service';
import { Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-contact-details',
  imports: [CommonModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  contact?: Contact;
  private subscription?: Subscription;

  constructor(private contactService: ContactService) {}

 ngOnInit(): void {
    // Kombiniere selectedContact$ und getContacts() um immer aktuelle Daten zu haben
    this.subscription = combineLatest([
      this.contactService.selectedContact$,
      this.contactService.getContacts()
    ]).pipe(
      map(([selectedContact, allContacts]) => {
        if (!selectedContact) return null;
        // Finde den aktuellen Kontakt in der Liste aller Kontakte
        return allContacts.find(contact => contact.id === selectedContact.id) || selectedContact;
      })
    ).subscribe({
      next: (contact) => {
        this.contact = contact || undefined;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


   // NEU - Edit-Funktionalität
  onEditContact(): void {
    if (this.contact) {
      // this.contactService.showAddForm();
      this.contactService.showEditForm(this.contact); //NEU
    }
  }

  // NEU - Delete-Funktionalität
  onDeleteContact(): void {
    if (this.contact?.id) {
      this.contactService.deleteContact(this.contact.id);
      this.contactService.clearSelection(); // Auswahl nach dem Löschen zurücksetzen
    }
  }
 

  getInitials(name?: string): string {
    if (!name) return 'NN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
}
