import { Component, OnInit, HostListener, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../services/contact.service';
import { TaskService, Task } from '../services/task.service';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * AddTaskComponent provides a comprehensive form for creating and editing tasks.
 * It supports task creation with priority, category, assigned contacts, due dates,
 * and subtasks. The component can operate in both standalone mode and overlay mode,
 * and handles both creating new tasks and editing existing ones.
 *
 * @example
 * <app-add-task 
 *   [defaultStatus]="'to-do'" 
 *   [isOverlayMode]="true"
 *   (taskAdded)="handleTaskAdded($event)"
 *   (closeOverlay)="handleClose()">
 * </app-add-task>
 */
@Component({
  selector: 'app-add-task',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit {
  @Output() taskAdded = new EventEmitter<string>;
  @Output() closeOverlay = new EventEmitter<void>();
  @Input() defaultStatus = '';
  @Input() isOverlayMode = false;

  selectedPriority: string = 'medium';
  contacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  showContactDropdown: boolean = false;
  showCategoryDropdown: boolean = false;
  showSubtaskConfirmation: boolean = false;
  subtaskInputFocused = false;
  selectedCategory: string = '';
  subtasks: { id: string | number; text: string; completed: boolean }[] = [];
  subtaskInput: string = '';
  nextSubtaskId: number = 1;
  editingSubtaskId: string | number | null = null;
  editingSubtaskText: string = '';
  isCreatingTask: boolean = false;
  showTitleError: boolean = false;
  showCategoryError: boolean = false;
  showDateError: boolean = false;
  showSuccessMessage: boolean = false;
  
  isEditingMode: boolean = false;
  editingTaskId: string | undefined;
  originalTaskStatus: 'to-do' | 'in-progress' | 'await-feedback' | 'done' = 'to-do';
  originalSubtasks: { id: string | number; text: string; completed: boolean }[] = [];
  
  formData = {
    title: '',
    description: '',
    dueDate: ''
  };
  
  categories = [
    { value: 'technical', label: 'Technical Task', color: '#1FD7C1' },
    { value: 'user story', label: 'User Story', color: '#0038FF' }
  ];

  /**
   * Constructor injecting required services for task management.
   * @param contactService - Service for managing contact operations.
   * @param taskService - Service for managing task operations.
   * @param router - Angular Router for navigation.
   * @param route - ActivatedRoute for accessing route parameters.
   */
  constructor(private contactService: ContactService, private taskService: TaskService, private router: Router, private route: ActivatedRoute) {}

  /**
   * Initializes the component by loading the status and contacts.
   */
  ngOnInit() {
    this.loadStatus();
    this.loadContacts();
    
  }

  /**
   * Loads the default status from route query parameters.
   */
  loadStatus() {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.defaultStatus = params['status'];
      }
    });
  }

  /**
   * Loads all contacts from the ContactService and then loads any task being edited.
   */
  loadContacts() {
    this.contactService.getContacts().subscribe(contacts => {
      this.contacts = contacts;
      this.loadEditingTask();
    });
  }

  /**
   * Loads a task that is being edited from the TaskService and populates the form.
   */
  loadEditingTask() {
    const editingTask = this.taskService.getEditingTask();
    if (editingTask) {
      this.isEditingMode = true;
      this.editingTaskId = editingTask.id;
      this.populateFormWithTaskData(editingTask);
      this.taskService.clearEditingTask();
    }
  }

  /**
   * Populates the form with data from an existing task for editing.
   * @param task - The task object containing the data to populate the form with.
   */
  async populateFormWithTaskData(task: any) {
    this.formData.title = task.title || '';
    this.formData.description = task.description || '';
    this.originalTaskStatus = task.status || 'to-do';
    if (task.date) {
      let dateValue: Date;
      if (task.date.toDate) {
        dateValue = task.date.toDate();
      } else if (task.date instanceof Date) {
        dateValue = task.date;
      } else {
        dateValue = new Date(task.date);
      }
      this.formData.dueDate = dateValue.toISOString().split('T')[0];
    }
    this.selectedPriority = task.priority || 'medium';
    this.selectedCategory = task.category || '';
    if (task.assignedTo && task.assignedTo.length > 0) {
      this.selectedContacts = this.contacts.filter(contact => 
        task.assignedTo.includes(contact.id)
      );
    }
    if (task.id) {
      this.taskService.getSubtasks(task.id).subscribe(subtasks => {
        this.subtasks = subtasks.map((subtask) => ({
          id: subtask.id || '',
          text: subtask.title,
          completed: subtask.isCompleted
        }));
        this.originalSubtasks = [...this.subtasks];
        this.nextSubtaskId = this.subtasks.length + 1;
      });
    }
  }

  /**
   * Handles clicks outside of dropdowns to close them.
   * @param event - The click event.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown') && !target.closest('.subtask-input')) {
      this.showContactDropdown = false;
      this.showCategoryDropdown = false;
    }
  }

  /**
   * Sets the task priority.
   * @param priority - The priority level to set ('low', 'medium', 'urgent').
   */
  setPriority(priority: string) {
    this.selectedPriority = priority;
  }

  /**
   * Toggles the contact dropdown visibility.
   */
  toggleContactDropdown() {
    this.showContactDropdown = !this.showContactDropdown;
    this.showCategoryDropdown = false;
  }

  /**
   * Toggles the category dropdown visibility.
   */
  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
    this.showContactDropdown = false;
  }

  /**
   * Handles subtask input click to clear the input if confirmation is not shown.
   */
  onSubtaskInputClick() {
    if (!this.showSubtaskConfirmation) {
      this.subtaskInput = '';
    }
  }

  /**
   * Handles Enter key press on subtask input to add the subtask.
   * @param event - The keyboard event.
   */
  onSubtaskEnter(event: Event) {
    event.preventDefault();
    if (this.subtaskInput && this.subtaskInput.trim()) {
      this.addSubtask();
    }
  }

  /**
   * Confirms and adds the subtask.
   * @param event - The event that triggered the confirmation.
   */
  confirmSubtask(event: Event) {
    if(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.addSubtask();
    this.showSubtaskConfirmation = false;
  }

  /**
   * Cancels subtask creation and clears the input.
   */
  cancelSubtask() {
    this.subtaskInput = '';
    this.showSubtaskConfirmation = false;
  }

  /**
   * Toggles the selection state of a contact.
   * @param contact - The contact to select or deselect.
   */
  selectContact(contact: Contact) {
    const index = this.selectedContacts.findIndex(c => c.id === contact.id);
    if (index === -1) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(index, 1);
    }
  }

  /**
   * Selects a category and closes the dropdown.
   * @param category - The category to select.
   */
  selectCategory(category: any) {
    this.selectedCategory = category.value;
    this.showCategoryDropdown = false;
    this.onCategorySelect();
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
   * Returns the text to display for the selected category.
   * @returns The category label or default text.
   */
  getCategoryText(): string {
    if (!this.selectedCategory) {
      return 'Select task category';
    }
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.label : 'Select task category';
  }

  /**
   * Returns the color for the selected category.
   * @returns The category color or default color.
   */
  getCategoryColor(): string {
    if (!this.selectedCategory) {
      return '#ccc';
    }
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.color : '#ccc';
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
   * Adds a new subtask to the task.
   */
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

  /**
   * Deletes a subtask by its ID.
   * @param id - The ID of the subtask to delete.
   */
  deleteSubtask(id: string | number) {
    this.subtasks = this.subtasks.filter(subtask => subtask.id !== id);
  }

  /**
   * Edits the text of a subtask.
   * @param id - The ID of the subtask to edit.
   * @param newText - The new text for the subtask.
   */
  editSubtask(id: string | number, newText: string) {
    const subtask = this.subtasks.find(s => s.id === id);
    if (subtask) {
      subtask.text = newText.trim();
    }
  }

  /**
   * Initiates editing mode for a subtask.
   * @param id - The ID of the subtask to edit.
   * @param currentText - The current text of the subtask.
   */
  editSubtaskPrompt(id: string | number, currentText: string) {
    this.editingSubtaskId = id;
    this.editingSubtaskText = currentText;
    setTimeout(() => {
      const inputElement = document.querySelector('.subtask-edit-input') as HTMLInputElement;
      if (inputElement) {
        inputElement.value = this.editingSubtaskText;
        inputElement.focus();
        inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
      }
    }, 100);
  }

  /**
   * Saves the edited subtask text.
   */
  saveSubtaskEdit() {
    if (this.editingSubtaskId !== null) {
      if (this.editingSubtaskText && this.editingSubtaskText.trim()) {
        this.editSubtask(this.editingSubtaskId, this.editingSubtaskText.trim());
      }
      this.cancelSubtaskEdit();
    }
  }

  /**
   * Cancels subtask editing mode.
   */
  cancelSubtaskEdit() {
    this.editingSubtaskId = null;
    this.editingSubtaskText = '';
  }

  /**
   * Handles keyboard shortcuts for subtask editing.
   * @param event - The keyboard event.
   */
  onSubtaskEditKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveSubtaskEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelSubtaskEdit();
    }
  }

  /**
   * Toggles the completion state of a subtask.
   * @param id - The ID of the subtask to toggle.
   */
  toggleSubtaskCompletion(id: string | number) {
    const subtask = this.subtasks.find(s => s.id === id);
    if (subtask) {
      subtask.completed = !subtask.completed;
    }
  }

  /**
   * Clears the form and resets all component state to default values.
   */
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
    this.showSubtaskConfirmation = false;
    this.isCreatingTask = false;
    this.showTitleError = false;
    this.showCategoryError = false;
    this.showDateError = false;
    this.showSuccessMessage = false;
    this.isEditingMode = false;
    this.editingTaskId = undefined;
    this.originalTaskStatus = 'to-do';
    this.originalSubtasks = [];
  }

  /**
   * Creates or updates a task after form validation.
   * @param event - The form submission event.
   */
  async createTask(event: Event) {
    event.preventDefault(); 
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
        await this.updateTask();
      } else {
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

  /**
   * Adds a new task to the system.
   */
  async addNewTask() {
    if(!this.defaultStatus){
      this.defaultStatus = 'to-do';
    } 
    const newTask: Task = {
      title: this.formData.title.trim(),
      description: this.formData.description?.trim() || '',
      date: new Date(this.formData.dueDate),
      priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
      status: this.defaultStatus,
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

  /**
   * Updates an existing task with new data.
   */
  async updateTask() {
    if (!this.editingTaskId) return;

    const updatedTask: Task = {
      id: this.editingTaskId,
      title: this.formData.title.trim(),
      description: this.formData.description?.trim() || '',
      date: new Date(this.formData.dueDate),
      priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
      status: this.originalTaskStatus,
      assignedTo: this.selectedContacts.map(contact => contact.id).filter(id => id !== undefined) as string[],
      category: this.selectedCategory as 'technical' | 'user story'
    };

    await this.taskService.updateTask(this.editingTaskId, updatedTask);
    if (this.editingTaskId) {
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
      for (const subtask of this.subtasks) {
        if (typeof subtask.id === 'string' && subtask.id.length > 0) {
          await this.taskService.updateSubtask(
            this.editingTaskId,
            subtask.id,
            {
              title: subtask.text,
              isCompleted: subtask.completed
            });
        } else {
          await this.taskService.addSubtask(this.editingTaskId, {
            title: subtask.text,
            isCompleted: subtask.completed
          });
        }
      }
    }
  }

  /**
   * Handles title input changes and clears error state.
   */
  onTitleInput() {
    if (this.formData.title.trim()) {
      this.showTitleError = false;
    }
  }

  /**
   * Handles category selection and clears error state.
   */
  onCategorySelect() {
    if (this.selectedCategory) {
      this.showCategoryError = false;
    }
  }

  /**
   * Handles date selection and clears error state.
   */
  onDateSelect() {
    if (this.formData.dueDate) {
      this.showDateError = false;
    }
  }

  /**
   * Returns today's date in ISO format for date input validation.
   * @returns Today's date in YYYY-MM-DD format.
   */
  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Closes the overlay mode by emitting the close event.
   */
  closeOverlayMode() {
    this.closeOverlay.emit();
  }
}
