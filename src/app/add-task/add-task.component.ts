import { Component, OnInit, OnDestroy, HostListener, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
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
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit, OnDestroy {
  @Output() taskAdded = new EventEmitter<string>;
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
  originalTaskStatus: 'to-do' | 'in-progress' | 'await-feedback' | 'done' = 'to-do';
  originalSubtasks: Subtask[] = [];

  formData = {
    title: '',
    description: '',
    dueDate: ''
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
  ) { }

  /**
   * Initializes the component by loading the status and contacts.
   */
  ngOnInit() {
    this.loadStatus();
    this.loadContacts();

  }

  /**
   * Lifecycle hook that runs when the component is destroyed.
   * Clears all form data and manager states to prevent state leaking.
   */
  ngOnDestroy() {
    this.clearForm();
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
  * Loads a task currently being edited from the TaskService and
  * populates the form with its data. Clears managers if no task is loaded.
  */
  loadEditingTask(): void {
    const editingTask = this.taskService.getEditingTask();

    if (editingTask) {
      this.isEditingMode = true;
      this.editingTaskId = editingTask.id;
      this.populateFormWithTaskData(editingTask);
      this.taskService.clearEditingTask();
    } else {
      this.clearAllManagers();
    }
  }

  /**
   * Clears all internal managers (contact, category, subtask)
   * to prevent leaking state between tasks.
   */
  private clearAllManagers(): void {
    this.contactManager.clearAll();
    this.categoryManager.clearAll();
    this.subtaskManager.clearAll();
  }

  /**
   * Populates the form with data from the given task.
   *
   * @param task - The task object to use for populating form fields.
   */
  async populateFormWithTaskData(task: any): Promise<void> {
    this.setBasicFormData(task);
    this.setDueDate(task.date);
    this.setPriorityAndCategory(task);
    this.setAssignedContacts(task.assignedTo);

    if (task.id) {
      this.loadAndSetSubtasks(task.id);
    }
  }

  /**
   * Sets basic task information (title, description, status) in the form.
   *
   * @param task - The task object.
   */
  private setBasicFormData(task: any): void {
    this.formData.title = task.title || '';
    this.formData.description = task.description || '';
    this.originalTaskStatus = task.status || 'to-do';
  }

  /**
   * Converts and sets the due date in the form if available.
   *
   * @param date - The due date value from the task (can be string, Date, or Firestore Timestamp).
   */
  private setDueDate(date: any): void {
    if (!date) return;

    let dateValue: Date;
    if (date.toDate) {
      dateValue = date.toDate();
    } else if (date instanceof Date) {
      dateValue = date;
    } else {
      dateValue = new Date(date);
    }

    this.formData.dueDate = dateValue.toISOString().split('T')[0];
  }

  /**
   * Sets the selected priority and category in their respective managers.
   *
   * @param task - The task object.
   */
  private setPriorityAndCategory(task: any): void {
    this.selectedPriority = task.priority || 'medium';
    this.categoryManager.setSelectedCategory(task.category || '');
  }

  /**
   * Filters and sets the assigned contacts in the contact manager.
   *
   * @param assignedToIds - Array of contact IDs assigned to the task.
   */
  private setAssignedContacts(assignedToIds: string[]): void {
    if (!assignedToIds || assignedToIds.length === 0) return;

    const selectedContacts = this.contacts
      .filter(contact => contact.id !== undefined)
      .filter(contact => assignedToIds.includes(contact.id as string));

    this.contactManager.setSelectedContacts(selectedContacts);
  }

  /**
   * Loads subtasks for the given task ID and sets them in the subtask manager.
   *
   * @param taskId - The ID of the task whose subtasks should be loaded.
   */
  private loadAndSetSubtasks(taskId: string): void {
    this.taskService.getSubtasks(taskId).subscribe(subtasks => {
      const mappedSubtasks = subtasks.map(subtask => ({
        id: subtask.id || '',
        text: subtask.title,
        completed: subtask.isCompleted,
      }));

      this.subtaskManager.setSubtasks(mappedSubtasks);
      this.originalSubtasks = [...mappedSubtasks];
    });
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
  * Resets the task creation form to its default state.
  */
  clearForm(): void {
    this.resetFormData();
    this.resetStateFlags();
    this.resetManagers();
  }

  /**
 * Handles task creation or editing after form validation.
 * Emits an event and navigates to the board on success.
 *
 * @param event - The form submission event.
 */
  async createTask(event: Event): Promise<void> {
    event.preventDefault();
    this.resetValidationErrors();

    if (this.formHasErrors()) return;

    this.setCreatingState(true);

    try {
      await this.saveTaskWithSuccessFeedback();
    } catch (error) {
      this.handleTaskSaveError(error);
    } finally {
      this.setCreatingState(false);
    }
  }

  /**
   * Emits event, shows success message and navigates after saving the task.
   */
  private async saveTaskWithSuccessFeedback(): Promise<void> {
    await this.saveTask();
    this.taskAdded.emit('added');
    this.showSuccessMessage = true;

    setTimeout(() => {
      this.clearFormAndNavigate();
    }, 2000);
  }

  /**
   * Clears the form and navigates to the board.
   */
  private clearFormAndNavigate(): void {
    this.clearForm();
    this.router.navigate(['/board']);
  }

  /**
   * Handles errors that occur during task saving.
   *
   * @param error - The caught error.
   */
  private handleTaskSaveError(error: unknown): void {
    console.error('Error while creating/updating task:', error);
  }

  /**
   * Sets the loading/creating state flag.
   *
   * @param state - Whether the task is currently being created.
   */
  private setCreatingState(state: boolean): void {
    this.isCreatingTask = state;
  }

  /**
   * Resets the form data fields to empty/default values.
   */
  private resetFormData(): void {
    this.formData = {
      title: '',
      description: '',
      dueDate: ''
    };
    this.selectedPriority = 'medium';
  }

  /**
   * Resets all form-related UI and logic state flags.
   */
  private resetStateFlags(): void {
    this.isCreatingTask = false;
    this.isEditingMode = false;
    this.editingTaskId = undefined;
    this.originalTaskStatus = 'to-do';
    this.originalSubtasks = [];
    this.showSuccessMessage = false;
    this.resetValidationErrors();
  }

  /**
   * Clears all manager components (contacts, categories, subtasks).
   */
  private resetManagers(): void {
    this.contactManager.clearAll();
    this.categoryManager.clearAll();
    this.subtaskManager.clearAll();
  }

  /**
   * Resets validation error flags.
   */
  private resetValidationErrors(): void {
    this.showTitleError = false;
    this.showCategoryError = false;
    this.showDateError = false;
  }

  /**
  * Validates the form fields and sets error flags.
  *
  * @returns True if the form has validation errors.
  */
  private formHasErrors(): boolean {
    const titleError = this.validateTitle();
    const categoryError = this.validateCategory();
    const dateError = this.validateDueDate();

    return titleError || categoryError || dateError;
  }

  /**
   * Validates the task title and sets the error flag if invalid.
   *
   * @returns True if the title is invalid.
   */
  private validateTitle(): boolean {
    const isInvalid = !this.formData.title.trim();
    this.showTitleError = isInvalid;
    return isInvalid;
  }

  /**
   * Validates the category selection and sets the error flag if none is selected.
   *
   * @returns True if no category is selected.
   */
  private validateCategory(): boolean {
    const isInvalid = !this.categoryManager.hasSelectedCategory();
    this.showCategoryError = isInvalid;
    return isInvalid;
  }

  /**
   * Validates the due date and sets the error flag if missing.
   *
   * @returns True if the due date is invalid.
   */
  private validateDueDate(): boolean {
    const isInvalid = !this.formData.dueDate;
    this.showDateError = isInvalid;
    return isInvalid;
  }


  /**
   * Creates or updates the task depending on the mode.
   */
  private async saveTask(): Promise<void> {
    if (this.isEditingMode && this.editingTaskId) {
      await this.updateTask();
    } else {
      await this.addNewTask();
    }
  }

  /**
 * Adds a new task with optional subtasks.
 */
  async addNewTask(): Promise<void> {
    this.ensureDefaultStatus();

    const newTask: Task = this.buildTask(this.defaultStatus);
    const savedTask = await this.taskService.addTask(newTask);

    if (savedTask?.id) {
      await this.saveAllSubtasks(savedTask.id, this.subtaskManager.getSubtasks());
    }
  }

  /**
   * Updates an existing task and its subtasks.
   */
  async updateTask(): Promise<void> {
    if (!this.editingTaskId) return;

    const updatedTask: Task = this.buildTask(this.originalTaskStatus, this.editingTaskId);
    await this.taskService.updateTask(this.editingTaskId, updatedTask);

    const currentSubtasks = this.subtaskManager.getSubtasks();
    const deleted = this.getDeletedSubtasks(currentSubtasks);

    await this.deleteSubtasks(this.editingTaskId, deleted);
    await this.syncSubtasks(this.editingTaskId, currentSubtasks);
  }

  /**
   * Ensures a default task status is set.
   */
  private ensureDefaultStatus(): void {
    if (!this.defaultStatus) {
      this.defaultStatus = 'to-do';
    }
  }

  /**
   * Constructs a task object from current form values.
   * 
   * @param status - The status to assign to the task.
   * @param id - (Optional) ID of the task (for updates).
   * @returns A task object ready to be saved.
   */
  private buildTask(status: string, id?: string): Task {
    const uniqueContactIds = this.getUniqueAssignedContactIds();

    return {
      id,
      title: this.formData.title.trim(),
      description: this.formData.description?.trim() || '',
      date: new Date(this.formData.dueDate),
      priority: this.selectedPriority as 'low' | 'medium' | 'urgent',
      status,
      assignedTo: uniqueContactIds,
      category: this.categoryManager.getSelectedCategory() as 'technical' | 'user story'
    };
  }

  /**
   * Returns a list of unique contact IDs currently assigned.
   */
  private getUniqueAssignedContactIds(): string[] {
    const contacts = this.contactManager.getSelectedContacts();
    return [...new Set(contacts.map(c => c.id).filter(id => id !== undefined))] as string[];
  }

  /**
   * Saves all given subtasks to the task with the specified ID.
   * 
   * @param taskId - The ID of the task to add subtasks to.
   * @param subtasks - The list of subtasks to be saved.
   */
  private async saveAllSubtasks(taskId: string, subtasks: any[]): Promise<void> {
    for (const subtask of subtasks) {
      await this.taskService.addSubtask(taskId, {
        title: subtask.text,
        isCompleted: subtask.completed
      });
    }
  }

  /**
   * Returns a list of original subtasks that have been deleted.
   * 
   * @param currentSubtasks - The current list of subtasks in the form.
   */
  private getDeletedSubtasks(currentSubtasks: any[]): any[] {
    return this.originalSubtasks.filter(original =>
      typeof original.id === 'string' &&
      original.id.length > 0 &&
      !currentSubtasks.some(current => current.id === original.id)
    );
  }

  /**
   * Deletes the given subtasks from the specified task.
   * 
   * @param taskId - The ID of the task.
   * @param subtasks - The subtasks to delete.
   */
  private async deleteSubtasks(taskId: string, subtasks: any[]): Promise<void> {
    for (const subtask of subtasks) {
      if (typeof subtask.id === 'string') {
        await this.taskService.deleteSubtask(taskId, subtask.id);
      }
    }
  }

  /**
   * Syncs all current subtasks (add or update) with the backend.
   * 
   * @param taskId - The ID of the task to sync with.
   * @param subtasks - The current list of subtasks in the form.
   */
  private async syncSubtasks(taskId: string, subtasks: any[]): Promise<void> {
    for (const subtask of subtasks) {
      const subtaskData = {
        title: subtask.text,
        isCompleted: subtask.completed
      };

      if (typeof subtask.id === 'string' && subtask.id.length > 0) {
        await this.taskService.updateSubtask(taskId, subtask.id, subtaskData);
      } else {
        await this.taskService.addSubtask(taskId, subtaskData);
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
   * Also clears form data to prevent state leaking.
   */
  closeOverlayMode() {
    this.clearForm();
    this.closeOverlay.emit();
  }
}
