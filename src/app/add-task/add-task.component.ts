import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../services/contact.service';
import { TaskService, Task } from '../services/task.service';
import { Router } from '@angular/router';

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
  isCreatingTask: boolean = false;
  showTitleError: boolean = false;
  showCategoryError: boolean = false;
  showDateError: boolean = false;
  showSuccessMessage: boolean = false;
  
  formData = {
    title: '',
    description: '',
    dueDate: ''
  };
  
  subtaskSuggestions = [
    'Contact Form',
    'Write legal Import'
  ];
  
  categories = [
    { value: 'technical', label: 'Technical Task', color: '#1FD7C1' },
    { value: 'user', label: 'User Story', color: '#0038FF' }
  ];

  constructor(private contactService: ContactService, private taskService: TaskService, private router: Router) {}

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
    if (this.showSubtaskConfirmation) {
      return;
    }
    this.showSubtaskSuggestions = true;
    this.showContactDropdown = false;
    this.showCategoryDropdown = false;
  }

  onSubtaskInputClick() {
    if (!this.showSubtaskConfirmation) {
      this.subtaskInput = '';
      this.showSubtaskDropdown();
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
    this.showSubtaskSuggestions = false;
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
    this.onCategorySelect();
  }

  isContactSelected(contact: Contact): boolean {
    return this.selectedContacts.some(c => c.id === contact.id);
  }

  getSelectedContactsText(): string {
    return 'Select contacts to assign';
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
      this.showSubtaskSuggestions = false;
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

  clearForm() {
    this.formData = {
      title: '',
      description: '',
      dueDate: ''
    };
    this.selectedPriority = 'medium';
    this.selectedContacts = [];
    this.selectedCategory = '';
    this.subtasks = [];
    this.subtaskInput = '';
    this.nextSubtaskId = 1;
    this.showContactDropdown = false;
    this.showCategoryDropdown = false;
    this.showSubtaskSuggestions = false;
    this.showSubtaskConfirmation = false;
    this.isCreatingTask = false;
    this.showTitleError = false;
    this.showCategoryError = false;
    this.showDateError = false;
    this.showSuccessMessage = false;
  }

  async createTask() {
    this.showTitleError = false;
    this.showCategoryError = false;
    this.showDateError = false;

    let hasErrors = false;

    if (!this.formData.title.trim()) {
      this.showTitleError = true;
      hasErrors = true;
    }

    if (!this.selectedCategory) {
      this.showCategoryError = true;
      hasErrors = true;
    }

    if (!this.formData.dueDate) {
      this.showDateError = true;
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    this.isCreatingTask = true;

    try {
      const newTask: Task = {
        title: this.formData.title.trim(),
        description: this.formData.description?.trim() || '',
        date: new Date(this.formData.dueDate),
        priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
        status: 'to-do',
        assignedTo: this.selectedContacts.map(contact => contact.id).filter(id => id !== undefined) as string[],
        category: this.selectedCategory as 'technical' | 'user'
      };
      const savedTask = await this.taskService.addTask(newTask);
      
      if (savedTask) {
        if (this.subtasks.length > 0 && savedTask.id) {
          for (const subtask of this.subtasks) {
            await this.taskService.addSubtask(savedTask.id, {
              title: subtask.text,
              isCompleted: subtask.completed
            });
          }
        }
        this.showSuccessMessage = true;
        setTimeout(() => {
          this.clearForm();
          this.router.navigate(['/board']);
        }, 2000);
      } else {
        console.error('Fehler beim Erstellen der Task');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Task:', error);
    } finally {
      this.isCreatingTask = false;
    }
  }

  onTitleInput() {
    if (this.formData.title.trim()) {
      this.showTitleError = false;
    }
  }

  onCategorySelect() {
    if (this.selectedCategory) {
      this.showCategoryError = false;
    }
  }

  onDateSelect() {
    if (this.formData.dueDate) {
      this.showDateError = false;
    }
  }
}
