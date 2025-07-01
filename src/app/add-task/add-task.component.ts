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
  showCategoryDropdown: boolean = false;
  selectedCategory: string = '';
  
  categories = [
    { value: 'technical-task', label: 'Technical Task', color: '#1FD7C1' },
    { value: 'user-story', label: 'User Story', color: '#0038FF' }
  ];

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    this.loadContacts();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.showContactDropdown = false;
      this.showCategoryDropdown = false;
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
    this.showCategoryDropdown = false; // Schließe andere Dropdowns
  }

  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
    this.showContactDropdown = false; // Schließe andere Dropdowns
  }

  selectContact(contact: Contact) {
    const index = this.selectedContacts.findIndex(c => c.id === contact.id);
    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
  }

  selectCategory(category: any) {
    this.selectedCategory = category.value;
    this.showCategoryDropdown = false;
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

  getCategoryText(): string {
    if (!this.selectedCategory) {
      return 'Select task category';
    }
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.label : 'Select task category';
  }

  getCategoryColor(): string {
    if (!this.selectedCategory) {
      return '#ccc';
    }
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.color : '#ccc';
  }

  getContactInitials(contact: Contact): string {
    return this.contactService.getInitials(contact.name);
  }

  getContactColor(contact: Contact): string {
    return this.contactService.getContactColor(contact.name);
  }
}
