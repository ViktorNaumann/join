import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService, Contact } from '../../services/contact.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit, OnDestroy {
  groupedContacts: { [key: string]: Contact[] } = {};
  selectedContact: Contact | null = null; //NEU
  private contactsSubscription: Subscription = new Subscription();
  private selectionSubscription: Subscription = new Subscription(); //NEU

  @Output() contactSelected = new EventEmitter<void>();

  constructor(public contactService: ContactService) {}

  ngOnInit(): void {
    this.contactsSubscription = this.contactService.getContacts().subscribe({
      next: (contacts) => {
        this.groupedContacts = this.groupByInitial(contacts);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
      }
    });


    // Aktuelle Auswahl verfolgen für visuelle Hervorhebung
    this.selectionSubscription = this.contactService.selectedContact$.subscribe(
      contact => this.selectedContact = contact
    );

  }


  ngOnDestroy(): void {
    this.contactsSubscription.unsubscribe();
    this.selectionSubscription.unsubscribe();
  }

  
   onContactSelect(contact: Contact): void {
    this.contactService.selectContact(contact);

    // Neues Event für Mobile-Navigation emittieren
    this.contactSelected.emit();
  }

  
  isSelected(contact: Contact): boolean {
    return this.selectedContact?.id === contact.id;
  }

  // Methode für Add-Button
  onAddNewContact(): void {
    this.contactService.showAddForm();
  }

  groupByInitial(contacts: Contact[]): { [key: string]: Contact[] } {
    const validContacts = contacts.filter(contact => contact && contact.name);
    
    return validContacts.reduce((groups, contact) => {
      const initial = contact.name.charAt(0).toUpperCase();
      groups[initial] = groups[initial] || [];
      groups[initial].push(contact);
      groups[initial].sort((a, b) => a.name.localeCompare(b.name));
      return groups;
    }, {} as { [key: string]: Contact[] });
  }

  keyAsc = (a: any, b: any) => a.key.localeCompare(b.key);

  getInitials(name: string | undefined): string {
    return this.contactService.getInitials(name);
  }
}


