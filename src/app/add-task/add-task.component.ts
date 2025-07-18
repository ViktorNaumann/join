import {
  Component,
  OnInit,
  HostListener,
  Output,
  Input,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../services/contact.service';
import { TaskService, Task } from '../services/task.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SubtaskManager, Subtask } from './subtask-manager';
import { ContactManager } from './contact-manager';
import { CategoryManager } from './category-manager';

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
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent implements OnInit {
  @Output() taskAdded = new EventEmitter<string>();
  @Output() closeOverlay = new EventEmitter<void>();
  @Input() defaultStatus = '';
  @Input() isOverlayMode = false;

  selectedPriority: string = 'medium';
  contacts: Contact[] = [];
  subtaskInputFocused = false;
  isCreatingTask: boolean = false;
  showTitleError: boolean = false;
  showCategoryError: boolean = false;
  showDateError: boolean = false;
  showSuccessMessage: boolean = false;

  isEditingMode: boolean = false;
  editingTaskId: string | undefined;
  originalTaskStatus: 'to-do' | 'in-progress' | 'await-feedback' | 'done' =
    'to-do';
  originalSubtasks: Subtask[] = [];

  formData = {
    title: '',
    description: '',
    dueDate: '',
  };

  /**
   * Constructor injecting required services for task management.
   * @param contactService - Service for managing contact operations.
   * @param taskService - Service for managing task operations.
   * @param router - Angular Router for navigation.
   * @param route - ActivatedRoute for accessing route parameters.
   * @param subtaskManager - Service for managing subtask operations.
   * @param contactManager - Service for managing contact operations.
   * @param categoryManager - Service for managing category operations.
   */
  constructor(
    private contactService: ContactService,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    public subtaskManager: SubtaskManager,
    public contactManager: ContactManager,
    public categoryManager: CategoryManager
  ) {}

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
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.defaultStatus = params['status'];
      }
    });
  }

  /**
   * Loads all contacts from the ContactService and then loads any task being edited.
   */
  loadContacts() {
    this.contactService.getContacts().subscribe((contacts) => {
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
    this.setFormBasicFields(task);
    this.setFormDate(task);
    this.setPriorityAndCategory(task);
    this.setAssignedContacts(task);
    await this.loadSubtasksIfNeeded(task);
  }

  /**
   * Sets the basic fields of the form using the provided task data.
   * @param task - The task object containing title, description, and status.
   */
  private setFormBasicFields(task: any) {
    this.formData.title = task.title || '';
    this.formData.description = task.description || '';
    this.originalTaskStatus = task.status || 'to-do';
  }

  /**
   * Sets the due date field of the form using the provided task data.
   * @param task - The task object containing the date.
   */
  private setFormDate(task: any) {
    if (task.date) {
      let dateValue: Date;
      if (task.date.toDate) dateValue = task.date.toDate();
      else if (task.date instanceof Date) dateValue = task.date;
      else dateValue = new Date(task.date);
      this.formData.dueDate = dateValue.toISOString().split('T')[0];
    }
  }

  /**
   * Sets the priority and category fields of the form using the provided task data.
   * @param task - The task object containing priority and category.
   */
  private setPriorityAndCategory(task: any) {
    this.selectedPriority = task.priority || 'medium';
    this.categoryManager.setSelectedCategory(task.category || '');
  }

  /**
   * Sets the assigned contacts in the form using the provided task data.
   * @param task - The task object containing assigned contacts.
   */
  private setAssignedContacts(task: any) {
    if (task.assignedTo && task.assignedTo.length > 0) {
      const selectedContacts = this.contacts.filter((contact) =>
        task.assignedTo.includes(contact.id)
      );
      this.contactManager.setSelectedContacts(selectedContacts);
    }
  }

  /**
   * Loads subtasks for the given task if an ID is present.
   * @param task - The task object containing the ID.
   */
  private async loadSubtasksIfNeeded(task: any) {
    if (task.id) {
      this.taskService.getSubtasks(task.id).subscribe((subtasks) => {
        const mappedSubtasks = subtasks.map((subtask) => ({
          id: subtask.id || '',
          text: subtask.title,
          completed: subtask.isCompleted,
        }));
        this.subtaskManager.setSubtasks(mappedSubtasks);
        this.originalSubtasks = [...mappedSubtasks];
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
      this.contactManager.setShowContactDropdown(false);
      this.categoryManager.setShowCategoryDropdown(false);
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
    this.contactManager.toggleContactDropdown();
    this.categoryManager.setShowCategoryDropdown(false);
  }

  /**
   * Toggles the category dropdown visibility.
   */
  toggleCategoryDropdown() {
    this.categoryManager.toggleCategoryDropdown();
    this.contactManager.setShowContactDropdown(false);
  }

  /**
   * Selects a category and closes the dropdown.
   * @param category - The category to select.
   */
  selectCategory(category: any) {
    this.categoryManager.selectCategory(category);
    this.onCategorySelect();
  }

  /**
   * Clears the form and resets all component state to default values.
   */
  clearForm() {
    this.formData = {
      title: '',
      description: '',
      dueDate: '',
    };
    this.selectedPriority = 'medium';
    this.contactManager.clearAll();
    this.categoryManager.clearAll();
    this.subtaskManager.clearAll();
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
    this.resetErrorStates();
    if (this.hasFormErrors()) return;
    await this.handleTaskCreation();
  }

  /**
   * Resets all error state flags for the form.
   */
  private resetErrorStates() {
    this.showTitleError = false;
    this.showCategoryError = false;
    this.showDateError = false;
  }

  /**
   * Checks the form for validation errors.
   * @returns True if there are errors, otherwise false.
   */
  private hasFormErrors(): boolean {
    let hasErrors = false;
    if (!this.formData.title.trim()) {
      this.showTitleError = true;
      hasErrors = true;
    }
    if (!this.categoryManager.hasSelectedCategory()) {
      this.showCategoryError = true;
      hasErrors = true;
    }
    if (!this.formData.dueDate) {
      this.showDateError = true;
      hasErrors = true;
    }
    return hasErrors;
  }

  /**
   * Handles the creation or update of a task, including showing success and error handling.
   */
  private async handleTaskCreation() {
    this.isCreatingTask = true;
    try {
      await this.saveTask();
      this.showSuccessAndNavigate();
    } catch (error) {
      console.error('Fehler beim Erstellen/Bearbeiten der Task:', error);
    } finally {
      this.isCreatingTask = false;
    }
  }

  /**
   * Saves the current task, either by updating or adding a new one.
   */
  private async saveTask() {
    if (this.isEditingMode && this.editingTaskId) {
      await this.updateTask();
    } else {
      await this.addNewTask();
    }
    this.taskAdded.emit('added');
  }

  /**
   * Shows a success message and navigates to the board after a short delay.
   */
  private showSuccessAndNavigate() {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.clearForm();
      this.router.navigate(['/board']);
    }, 2000);
  }

  /**
   * Adds a new task to the system.
   */
  async addNewTask() {
    this.setDefaultStatusIfNeeded();
    const newTask = this.buildNewTask();
    const savedTask = await this.taskService.addTask(newTask);
    await this.saveSubtasksForNewTask(savedTask);
  }

  /**
   * Sets the default status if none is provided.
   */
  private setDefaultStatusIfNeeded() {
    if (!this.defaultStatus) {
      this.defaultStatus = 'to-do';
    }
  }

  /**
   * Builds a new Task object from the current form data.
   * @returns The constructed Task object.
   */
  private buildNewTask(): Task {
    const selectedContacts = this.contactManager.getSelectedContacts();
    return {
      title: this.formData.title.trim(),
      description: this.formData.description?.trim() || '',
      date: new Date(this.formData.dueDate),
      priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
      status: this.defaultStatus,
      assignedTo: selectedContacts
        .map((contact) => contact.id)
        .filter((id) => id !== undefined) as string[],
      category: this.categoryManager.getSelectedCategory() as
        | 'technical'
        | 'user story',
    };
  }

  /**
   * Saves all subtasks for a newly created task.
   * @param savedTask - The newly created task object.
   */
  private async saveSubtasksForNewTask(savedTask: Task | null | undefined) {
    const subtasks = this.subtaskManager.getSubtasks();
    if (savedTask && subtasks.length > 0 && savedTask.id) {
      for (const subtask of subtasks) {
        await this.taskService.addSubtask(savedTask.id, {
          title: subtask.text,
          isCompleted: subtask.completed,
        });
      }
    }
  }

  /**
   * Updates an existing task with new data.
   */
  async updateTask() {
    if (!this.editingTaskId) return;
    const updatedTask = this.buildUpdatedTask();
    await this.taskService.updateTask(this.editingTaskId, updatedTask);
    await this.handleSubtasksUpdate();
  }

  /**
   * Builds an updated Task object from the current form data.
   * @returns The constructed Task object.
   */
  private buildUpdatedTask(): Task {
    const selectedContacts = this.contactManager.getSelectedContacts();
    return {
      id: this.editingTaskId!,
      title: this.formData.title.trim(),
      description: this.formData.description?.trim() || '',
      date: new Date(this.formData.dueDate),
      priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
      status: this.originalTaskStatus,
      assignedTo: selectedContacts
        .map((contact) => contact.id)
        .filter((id) => id !== undefined) as string[],
      category: this.categoryManager.getSelectedCategory() as
        | 'technical'
        | 'user story',
    };
  }

  /**
   * Handles updating subtasks for an edited task.
   */
  private async handleSubtasksUpdate() {
    if (!this.editingTaskId) return;
    await this.deleteRemovedSubtasks();
    await this.updateOrAddSubtasks();
  }

  /**
   * Deletes subtasks that have been removed from the original list.
   */
  private async deleteRemovedSubtasks() {
    const currentSubtasks = this.subtaskManager.getSubtasks();
    const deletedSubtasks = this.originalSubtasks.filter(
      (original) =>
        typeof original.id === 'string' &&
        original.id.length > 0 &&
        !currentSubtasks.some((current) => current.id === original.id)
    );
    for (const deletedSubtask of deletedSubtasks) {
      if (typeof deletedSubtask.id === 'string') {
        await this.taskService.deleteSubtask(
          this.editingTaskId!,
          deletedSubtask.id
        );
      }
    }
  }

  /**
   * Updates existing subtasks or adds new ones for the current task.
   */
  private async updateOrAddSubtasks() {
    const currentSubtasks = this.subtaskManager.getSubtasks();
    for (const subtask of currentSubtasks) {
      if (typeof subtask.id === 'string' && subtask.id.length > 0) {
        await this.taskService.updateSubtask(this.editingTaskId!, subtask.id, {
          title: subtask.text,
          isCompleted: subtask.completed,
        });
      } else {
        await this.taskService.addSubtask(this.editingTaskId!, {
          title: subtask.text,
          isCompleted: subtask.completed,
        });
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
    if (this.categoryManager.hasSelectedCategory()) {
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
