import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../services/contact.service';

@Component({
  selector: 'app-add-task',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit {
  selectedPriority: string = 'medium';
  contacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  showContactDropdown: boolean = false;
  showCategoryDropdown: boolean = false;
  showSubtaskSuggestions: boolean = false;
  showSubtaskConfirmation: boolean = false;
  selectedCategory: string = '';
  subtasks: { id: number; text: string; completed: boolean }[] = [];
  subtaskInput: string = '';
  nextSubtaskId: number = 1;
  
  subtaskSuggestions = [
    'Contact Form',
    'Write legal Import'
  ];
  
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
    if (!target.closest('.dropdown') && !target.closest('.subtask-input')) {
      this.showContactDropdown = false;
      this.showCategoryDropdown = false;
      this.showSubtaskSuggestions = false;
      // Bestätigung nicht automatisch schließen
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
    this.showCategoryDropdown = false;
    this.showSubtaskSuggestions = false;
  }

  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
    this.showContactDropdown = false;
    this.showSubtaskSuggestions = false;
  }

  showSubtaskDropdown() {
    if (!this.showSubtaskConfirmation) {
      this.showSubtaskSuggestions = true;
      this.showContactDropdown = false;
      this.showCategoryDropdown = false;
    }
  }

  selectSubtaskSuggestion(suggestion: string) {
    this.subtaskInput = suggestion;
    this.showSubtaskSuggestions = false;
    this.showSubtaskConfirmation = true;
  }

  confirmSubtask() {
    this.addSubtask();
    this.showSubtaskConfirmation = false;
  }

  cancelSubtask() {
    this.subtaskInput = '';
    this.showSubtaskConfirmation = false;
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

  // Subtask Methods
  addSubtask() {
    if (this.subtaskInput && this.subtaskInput.trim()) {
      const newSubtask = {
        id: this.nextSubtaskId++,
        text: this.subtaskInput.trim(),
        completed: false
      };
      this.subtasks.push(newSubtask);
      this.subtaskInput = '';
      this.showSubtaskConfirmation = false;
    }
  }

  deleteSubtask(id: number) {
    this.subtasks = this.subtasks.filter(subtask => subtask.id !== id);
  }

  editSubtask(id: number, newText: string) {
    const subtask = this.subtasks.find(s => s.id === id);
    if (subtask && newText.trim()) {
      subtask.text = newText.trim();
    }
  }

  editSubtaskPrompt(id: number, currentText: string) {
    const newText = prompt('Edit subtask:', currentText);
    if (newText && newText.trim()) {
      this.editSubtask(id, newText);
    }
  }

  toggleSubtaskCompletion(id: number) {
    const subtask = this.subtasks.find(s => s.id === id);
    if (subtask) {
      subtask.completed = !subtask.completed;
    }
  }
}
