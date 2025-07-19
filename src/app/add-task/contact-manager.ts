import { Injectable } from '@angular/core';
import { Contact, ContactService } from '../services/contact.service';
import { EditTask } from './edit-task';
import { AddTaskComponent } from './add-task.component';
import { CategoryManager } from './category-manager';

/**
 * ContactManager handles all contact-related operations for the AddTaskComponent.
 * This includes contact selection, display, and dropdown management.
 */
@Injectable({
  providedIn: 'root'
})
export class ContactManager {
  private selectedContacts: Contact[] = [];
  private showContactDropdown: boolean = false;

  constructor(
    private contactService: ContactService,
    public editTaskManager: EditTask,
    public addTaskManager: AddTaskComponent,
    public categoryManager: CategoryManager
  ) {}

    /**
   * Loads all contacts from the ContactService and then loads any task being edited.
   */
  loadContacts() {
    this.contactService.getContacts().subscribe(contacts => {
      this.addTaskManager.contacts = contacts;
      this.editTaskManager.loadEditingTask();
    });
  }
  /**
   * Gets all selected contacts
   */
  getSelectedContacts(): Contact[] {
    return this.selectedContacts;
  }

  /**
   * Sets the selected contacts array
   */
  setSelectedContacts(contacts: Contact[]): void {
    const uniqueContacts = contacts.filter((contact, index, self) => 
      index === self.findIndex(c => c.id === contact.id)
    );
    this.selectedContacts = uniqueContacts;
  }

  /**
   * Gets the contact dropdown visibility state
   */
  getShowContactDropdown(): boolean {
    return this.showContactDropdown;
  }

  /**
   * Sets the contact dropdown visibility state
   */
  setShowContactDropdown(value: boolean): void {
    this.showContactDropdown = value;
  }

  /**
   * Toggles the contact dropdown visibility.
   */
  toggleDropdown(): void {
    this.showContactDropdown = !this.showContactDropdown;
  }

  /**
   * Toggles the selection state of a contact.
   * @param contact - The contact to select or deselect.
   */
  selectContact(contact: Contact): void {
    const index = this.selectedContacts.findIndex(c => c.id === contact.id);
    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
  }

  /**
   * Checks if a contact is currently selected.
   * @param contact - The contact to check.
   * @returns True if the contact is selected, false otherwise.
   */
  isContactSelected(contact: Contact): boolean {
    return this.selectedContacts.some(c => c.id === contact.id);
  }

  /**
   * Returns the text to display for selected contacts.
   * @returns The text to display in the contact selector.
   */
  getSelectedContactsText(): string {
    return 'Select contacts to assign';
  }

  /**
   * Returns the initials for a contact.
   * @param contact - The contact to get initials for.
   * @returns The contact's initials.
   */
  getContactInitials(contact: Contact): string {
    return this.contactService.getInitials(contact.name);
  }

  /**
   * Returns the color for a contact.
   * @param contact - The contact to get color for.
   * @returns The contact's color.
   */
  getContactColor(contact: Contact): string {
    return this.contactService.getContactColor(contact.name);
  }

  /**
   * Returns a comma-separated string of remaining contact names.
   * @param remainingContacts - The remaining contacts to display.
   * @returns A comma-separated string of contact names.
   */
  getRemainingContactNames(remainingContacts: Contact[]): string {
    return remainingContacts.map((contact) => contact.name).join(', ');
  }

  /**
   * Clears all selected contacts and resets dropdown state.
   */
  clearAll(): void {
    this.selectedContacts = [];
    this.showContactDropdown = false;
  }
}
