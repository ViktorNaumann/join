import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService, Contact } from '../services/contact.service';

@Component({
  selector: 'app-add-task',
  imports: [CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit {
  selectedPriority: string = 'medium';
  contacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  showContactDropdown: boolean = false;

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.loadContacts();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showContactDropdown = false;
    }
  }

  loadContacts() {
    this.contactService.getContacts().subscribe(contacts => {
      this.contacts = contacts;
    });
  }

  setPriority(priority: string) {
    this.selectedPriority = priority;
  }

  toggleContactDropdown() {
    this.showContactDropdown = !this.showContactDropdown;
  }

  selectContact(contact: Contact) {
    const index = this.selectedContacts.findIndex(c => c.id === contact.id);
    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
  }

  isContactSelected(contact: Contact): boolean {
    return this.selectedContacts.some(c => c.id === contact.id);
  }

  getSelectedContactsText(): string {
    if (this.selectedContacts.length === 0) {
      return 'Select contacts to assign';
    }
    return this.selectedContacts.map(c => c.name).join(', ');
  }

  getContactInitials(contact: Contact): string {
    return this.contactService.getInitials(contact.name);
  }

  getContactColor(contact: Contact): string {
    return this.contactService.getContactColor(contact.name);
  }
}
