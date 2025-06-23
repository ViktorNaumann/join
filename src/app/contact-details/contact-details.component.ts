import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactService, Contact } from '../services/contact.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-details',
  imports: [CommonModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  contact?: Contact;
  private selectedContactSubscription?: Subscription;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.selectedContactSubscription = this.contactService.selectedContact$.subscribe({
      next: (contact) => {
        this.contact = contact || undefined;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.selectedContactSubscription) {
      this.selectedContactSubscription.unsubscribe();
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
