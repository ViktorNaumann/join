import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
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
  @Output() taskAdded = new EventEmitter<string>

  selectedPriority: string = 'medium';
  contacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  showContactDropdown: boolean = false;
  showCategoryDropdown: boolean = false;
  showSubtaskSuggestions: boolean = false;
  showSubtaskConfirmation: boolean = false;
  selectedCategory: string = '';
  subtasks: { id: string | number; text: string; completed: boolean }[] = [];
  subtaskInput: string = '';
  nextSubtaskId: number = 1;
  isCreatingTask: boolean = false;
  showTitleError: boolean = false;
  showCategoryError: boolean = false;
  showDateError: boolean = false;
  showSuccessMessage: boolean = false;
  
  // Neue Eigenschaften für das Bearbeiten
  isEditingMode: boolean = false;
  editingTaskId: string | undefined;
  originalTaskStatus: 'to-do' | 'in-progress' | 'await-feedback' | 'done' = 'to-do';
  originalSubtasks: { id: string | number; text: string; completed: boolean }[] = [];
  
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

  loadContacts() {
    this.contactService.getContacts().subscribe(contacts => {
      this.contacts = contacts;
      console.log('Contacts loaded:', this.contacts);
      // Erst nach dem Laden der Kontakte die Edit-Task laden
      this.loadEditingTask();
    });
  }

  loadEditingTask() {
    const editingTask = this.taskService.getEditingTask();
    if (editingTask) {
      this.isEditingMode = true;
      this.editingTaskId = editingTask.id;
      this.populateFormWithTaskData(editingTask);
      // Task aus dem Service entfernen nach dem Laden
      this.taskService.clearEditingTask();
    }
  }

  async populateFormWithTaskData(task: any) {
    // Grunddaten setzen
    this.formData.title = task.title || '';
    this.formData.description = task.description || '';
    
    // Ursprünglichen Status speichern
    this.originalTaskStatus = task.status || 'to-do';
    
    // Datum konvertieren und setzen
    if (task.date) {
      let dateValue: Date;
      if (task.date.toDate) {
        // Firebase Timestamp
        dateValue = task.date.toDate();
      } else if (task.date instanceof Date) {
        dateValue = task.date;
      } else {
        dateValue = new Date(task.date);
      }
      this.formData.dueDate = dateValue.toISOString().split('T')[0];
    }
    
    // Priorität setzen
    this.selectedPriority = task.priority || 'medium';
    
    // Kategorie setzen
    this.selectedCategory = task.category || '';
    
    // Zugewiesene Kontakte laden
    if (task.assignedTo && task.assignedTo.length > 0) {
      console.log('Task assignedTo:', task.assignedTo);
      console.log('Available contacts:', this.contacts);
      this.selectedContacts = this.contacts.filter(contact => 
        task.assignedTo.includes(contact.id)
      );
      console.log('Selected contacts after filtering:', this.selectedContacts);
    }
    
    // Subtasks laden falls vorhanden
    if (task.id) {
      this.taskService.getSubtasks(task.id).subscribe(subtasks => {
        this.subtasks = subtasks.map((subtask) => ({
          id: subtask.id || '', // Firebase-ID beibehalten
          text: subtask.title,
          completed: subtask.isCompleted
        }));
        // Kopie der ursprünglichen Subtasks speichern
        this.originalSubtasks = [...this.subtasks];
        this.nextSubtaskId = this.subtasks.length + 1;
      });
    }
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
        id: this.nextSubtaskId++, // Für neue Subtasks verwenden wir erstmal numerische IDs
        text: this.subtaskInput.trim(),
        completed: false
      };
      this.subtasks.push(newSubtask);
      this.subtaskInput = '';
      this.showSubtaskConfirmation = false;
      this.showSubtaskSuggestions = false;
    }
  }

  deleteSubtask(id: string | number) {
    this.subtasks = this.subtasks.filter(subtask => subtask.id !== id);
  }

  editSubtask(id: string | number, newText: string) {
    const subtask = this.subtasks.find(s => s.id === id);
    if (subtask && newText.trim()) {
      subtask.text = newText.trim();
    }
  }

  editSubtaskPrompt(id: string | number, currentText: string) {
    const newText = prompt('Edit subtask:', currentText);
    if (newText && newText.trim()) {
      this.editSubtask(id, newText);
    }
  }

  toggleSubtaskCompletion(id: string | number) {
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
    // Bearbeitungsfelder zurücksetzen
    this.isEditingMode = false;
    this.editingTaskId = undefined;
    this.originalTaskStatus = 'to-do';
    this.originalSubtasks = [];
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
      if (this.isEditingMode && this.editingTaskId) {
        // Task bearbeiten
        await this.updateTask();
      } else {
        // Neue Task erstellen
        await this.addNewTask();
      }
      this.taskAdded.emit('added');
      
      this.showSuccessMessage = true;
      setTimeout(() => {
        this.clearForm();
        this.router.navigate(['/board']);
      }, 2000);
    } catch (error) {
      console.error('Fehler beim Erstellen/Bearbeiten der Task:', error);
    } finally {
      this.isCreatingTask = false;
    }
  }

  async addNewTask() {
    const newTask: Task = {
      title: this.formData.title.trim(),
      description: this.formData.description?.trim() || '',
      date: new Date(this.formData.dueDate),
      priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
      status: 'to-do',
      assignedTo: this.selectedContacts.map(contact => contact.id).filter(id => id !== undefined) as string[],
      category: this.selectedCategory as 'technical' | 'user story'
    };
    const savedTask = await this.taskService.addTask(newTask);
    
    if (savedTask && this.subtasks.length > 0 && savedTask.id) {
      for (const subtask of this.subtasks) {
        await this.taskService.addSubtask(savedTask.id, {
          title: subtask.text,
          isCompleted: subtask.completed
        });
      }
    }
  }

  async updateTask() {
    if (!this.editingTaskId) return;

    const updatedTask: Task = {
      id: this.editingTaskId,
      title: this.formData.title.trim(),
      description: this.formData.description?.trim() || '',
      date: new Date(this.formData.dueDate),
      priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
      status: this.originalTaskStatus, // Ursprünglichen Status beibehalten
      assignedTo: this.selectedContacts.map(contact => contact.id).filter(id => id !== undefined) as string[],
      category: this.selectedCategory as 'technical' | 'user story'
    };

    await this.taskService.updateTask(this.editingTaskId, updatedTask);
    
    // Subtasks verwalten
    if (this.editingTaskId) {
      // Gelöschte Subtasks finden und entfernen
      const deletedSubtasks = this.originalSubtasks.filter(original => 
        typeof original.id === 'string' && 
        original.id.length > 0 &&
        !this.subtasks.some(current => current.id === original.id)
      );
      
      for (const deletedSubtask of deletedSubtasks) {
        if (typeof deletedSubtask.id === 'string') {
          await this.taskService.deleteSubtask(this.editingTaskId, deletedSubtask.id);
        }
      }
      
      // Bestehende und neue Subtasks aktualisieren/hinzufügen
      for (const subtask of this.subtasks) {
        if (typeof subtask.id === 'string' && subtask.id.length > 0) {
          // Bestehende Subtask aktualisieren
          await this.taskService.updateSubtask(
            this.editingTaskId,
            subtask.id,
            {
              title: subtask.text,
              isCompleted: subtask.completed
            });
        } else {
          // Neue Subtask hinzufügen
          await this.taskService.addSubtask(this.editingTaskId, {
            title: subtask.text,
            isCompleted: subtask.completed
          });
        }
      }
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

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
