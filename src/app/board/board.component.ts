import {
  Component,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { TaskComponent } from './task/task.component';
import {
  trigger,
  style,
  transition,
  animate,
  AnimationEvent,
} from '@angular/animations';
import { TaskDetailsComponent } from './task-details/task-details.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDragMove,
} from '@angular/cdk/drag-drop';
import { Task } from '../services/task.service';
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { Subtask } from '../services/task.service';
import { Subscription } from 'rxjs';
import { ContactService } from '../services/contact.service';
import { Contact } from '../services/contact.service';
import { FormsModule } from '@angular/forms';
import { AddTaskComponent } from '../add-task/add-task.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  imports: [
    TaskComponent,
    TaskDetailsComponent,
    CdkDropList,
    CdkDrag,
    CommonModule,
    FormsModule,
    AddTaskComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      transition('void => right', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition('right => void', [
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),
      transition('void => bottom', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition('bottom => void', [
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateY(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})

/**
 * BoardComponent is the central component of the task management board.
 * It manages task lists, their statuses, drag-and-drop functionality,
 * overlays for task details and creation, as well as subtasks and contacts.
 *
 * Features:
 * - Categorized task lists: "to-do", "in-progress", "await-feedback", "done"
 * - Drag & drop task sorting and status changes (via Angular CDK)
 * - Task filtering via search term
 * - Animated overlay for task detail and add/edit view
 * - Subtask management per task
 * - Contact integration for assigning collaborators
 * - Responsive design (mobile / desktop behavior)
 */
export class BoardComponent {
  animationDirection: 'right' | 'bottom' = 'right';
  backgroundVisible = false;
  overlayVisible = false;
  showTaskDetails = false;
  showAddOrEditTask: boolean = false;
  selectedTask?: Task;
  searchTerm: string = '';
  unsubTask!: Subscription;
  unsubSubtask!: Subscription;
  unsubContact!: Subscription;
  taskList: Task[] = [];
  subtaskList: Subtask[] = [];
  contactList: Contact[] = [];
  subtasksByTaskId: { [taskId: string]: Subtask[] } = {};
  setTaskStatus: string = 'to-do';
  showBackToTop = false;
  openedMenuTaskId: string | null = null;

  /**
   * Constructs the BoardComponent with injected services for task management, navigation,
   * and contact handling.
   *
   * @param taskService - Service for managing tasks and subtasks.
   * @param router - Angular Router for navigating to different views (e.g., add-task).
   * @param contactService - Service for managing contact data.
   */
  constructor(
    private taskService: TaskService,
    private router: Router,
    private contactService: ContactService
  ) { }


  /**
   * Reference to the scrollable board section element.
   * Used to detect scrolling and show the "back to top" button.
   */
  @ViewChild('scrollSection') scrollSection!: ElementRef<HTMLElement>;

  /**
   * Lifecycle hook that runs after the component’s view has been fully initialized.
   * Adds a scroll event listener to the scrollable section.
   */
  ngAfterViewInit() {
    this.scrollSection.nativeElement.addEventListener('scroll', () =>
      this.onSectionScroll()
    );
  }

  /**
   * Handles scroll events and toggles visibility of the "back to top" button
   * if the scroll position exceeds a threshold.
   */
  onSectionScroll() {
    const scrollTop = this.scrollSection.nativeElement.scrollTop;
    this.showBackToTop = scrollTop > 300;
  }

  /**
   * Smoothly scrolls the scrollable section back to the top.
   */
  scrollToTop() {
    this.scrollSection.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Lifecycle hook that runs on component initialization.
   * Starts loading tasks from the task service.
   */
  ngOnInit(): void {
    this.loadTasks();
  }

  /**
   * Placeholder for handling user input in the search field.
   */
  onSearchInput() { }

  /**
   * Filters tasks by given status and current search term (case-insensitive).
   *
   * @param status - Task status to filter by ('to-do', 'in-progress', 'await-feedback', 'done').
   * @returns Filtered list of tasks.
   */
  getFilteredTasks(status: string): Task[] {
    const statusArrayMap: { [key: string]: Task[] } = {
      'to-do': this.todo,
      'in-progress': this.inprogress,
      'await-feedback': this.awaitfeedback,
      done: this.done,
    };
    const tasksForStatus = statusArrayMap[status] || [];
    if (!this.searchTerm.trim()) {
      return tasksForStatus;
    }
    const searchLower = this.searchTerm.toLowerCase();
    return tasksForStatus.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Sorts a list of tasks by their due date.
   *
   * @param tasks - Array of tasks to be sorted.
   * @param ascending - Whether to sort in ascending order (default: true).
   * @returns Sorted task array.
   */
  private sortTasksByDueDate(tasks: Task[], ascending: boolean = true): Task[] {
    return [...tasks].sort((a, b) => {
      const dateA = this.getDateValue(a.date);
      const dateB = this.getDateValue(b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  /**
   * Converts different date formats (Date, Firestore Timestamp, string) into a timestamp.
   *
   * @param date - Date input to convert.
   * @returns Numeric timestamp, or Number.MAX_SAFE_INTEGER if invalid.
   */
  private getDateValue(date: Date | any): number {
    if (date && typeof date.toDate === 'function') {
      return date.toDate().getTime();
    } else if (date instanceof Date) {
      return date.getTime();
    } else if (typeof date === 'string') {
      return new Date(date).getTime();
    }
    return Number.MAX_SAFE_INTEGER;
  }

  /**
   * Clears the current search input.
   */
  clearSearch() {
    this.searchTerm = '';
  }

  /**
   * Sets the animation direction based on screen width.
   * Used for responsive slide-in overlays.
   *
   * @param width - Current screen width.
   */
  setAnimationDirection(width: number) {
    this.animationDirection = width < 1000 ? 'bottom' : 'right';
  }

  /**
   * Handles removal of background and overlay if the event indicates closure.
   *
   * @param event - A string (expected: 'closed') that triggers background removal.
   */
  removeBackground(event: string) {
    if (event === 'closed') {
      this.backgroundVisible = false;
      this.overlayVisible = false;
    }
  }

  /**
   * Callback for when the overlay slide-in animation is finished.
   * Slight delay before making the background visible for smooth UX.
   *
   * @param event - AnimationEvent from Angular.
   */
  onOverlayAnimationDone(event: AnimationEvent) {
    if (event.toState === 'right' || event.toState === 'bottom') {
      setTimeout(() => {
        this.backgroundVisible = true;
      }, 50);
    }
  }
  /**
   * List of tasks status.
   */
  todo: Task[] = [];
  inprogress: Task[] = [];
  awaitfeedback: Task[] = [];
  done: Task[] = [];

  /**
 * Returns the delay for starting a drag action based on screen width.
 * Prevents accidental drags on small screens.
 *
 * @returns Drag delay in milliseconds.
 */
  getDragDelay(): number {
    return window.innerWidth < 1000 ? 250 : 0;
  }

  /**
 * Handles drag-and-drop actions for tasks using the Angular CDK.
 * Updates the task's status and reorders task lists accordingly.
 *
 * @param event - The CdkDragDrop event containing task data and drop context.
 */
  drop(event: CdkDragDrop<Task[]>) {
    const task = event.item.data as Task;
    let newStatus: Task['status'];
    if (event.container.id === 'todoList') {
      newStatus = 'to-do';
    } else if (event.container.id === 'inprogressList') {
      newStatus = 'in-progress';
    } else if (event.container.id === 'awaitfeedbackList') {
      newStatus = 'await-feedback';
    } else if (event.container.id === 'doneList') {
      newStatus = 'done';
    } else {
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (task.id && task.status !== newStatus) {
        const updatedTask: Task = { ...task, status: newStatus };
        this.taskService.updateTask(task.id, updatedTask).catch((error) => {
          console.error('Error updating task status:', error);
        });
      }
    }
    this.todo = this.sortTasksByDueDate(this.todo);
    this.inprogress = this.sortTasksByDueDate(this.inprogress);
    this.awaitfeedback = this.sortTasksByDueDate(this.awaitfeedback);
    this.done = this.sortTasksByDueDate(this.done);
  }

  /**
   * Stores the currently selected status for a new or edited task.
   *
   * @param status - The task status to set (e.g., 'to-do', 'done').
   */
  saveTaskStatus(status: string) {
    this.setTaskStatus = status;
  }

  /**
   * Opens the overlay for adding or editing a task.
   * On small screens, navigates to a separate route; otherwise opens the overlay inline.
   *
   * @param event - Either 'open' or 'edit', indicating the action type.
   * @param status - The status to prefill in the add/edit task form.
   */
  openAddOrEditOverlay(event: string, status: string) {
    const isSmallScreen = window.innerWidth < 1000;
    if (event === 'open' || event === 'edit') {
      if (isSmallScreen) {
        this.router.navigate(['/add-task'], { queryParams: { status } });
      } else {
        this.showTaskDetails = false;
        this.showAddOrEditTask = true;
      }
    }
    this.overlayVisible = true;
  }

  /**
   * Opens the overlay for viewing the details of a selected task.
   *
   * @param selectedTask - The task object to display in detail.
   */
  openTaskDetail(selectedTask: Task) {
    this.selectedTask = selectedTask;
    this.showTaskDetails = true;
    this.showAddOrEditTask = false;
    this.overlayVisible = true;
  }

  /**
   * Closes the overlay for task details or task form.
   * Also resets relevant state variables and clears editing data.
   *
   * @param event - A string indicating why the overlay is being closed (e.g., 'close', 'added').
   */
  closeDetailsOverlay(event: string) {
    if (event === 'close' || 'added') {
      this.overlayVisible = false;
      this.backgroundVisible = false;
      this.showTaskDetails = false;
      this.showAddOrEditTask = false;
      this.selectedTask = undefined;
      this.taskService.clearEditingTask();
    }
  }

  /**
  * Loads tasks from the task service and distributes them into status-based lists.
  * Also sorts tasks by due date and loads their subtasks.
  *
  * @returns A function to unsubscribe from the task observable.
  */
  loadTasks() {
    this.unsubTask = this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.taskList = tasks;
      this.emptyArrays();
      for (const task of tasks) {
        switch (task.status) {
          case 'to-do':
            this.todo.push(task);
            break;
          case 'in-progress':
            this.inprogress.push(task);
            break;
          case 'await-feedback':
            this.awaitfeedback.push(task);
            break;
          case 'done':
            this.done.push(task);
            break;
          default:
            console.warn(
              `Unbekannter Status bei Task ${task.title}:`,
              task.status
            );
        }
      }
      this.todo = this.sortTasksByDueDate(this.todo);
      this.inprogress = this.sortTasksByDueDate(this.inprogress);
      this.awaitfeedback = this.sortTasksByDueDate(this.awaitfeedback);
      this.done = this.sortTasksByDueDate(this.done);
      this.loadSubtasks();
    });
    return () => this.unsubTask.unsubscribe();
  }

  /**
  * Empties all task lists (to-do, in-progress, await-feedback, done).
  */
  emptyArrays() {
    this.todo = [];
    this.inprogress = [];
    this.awaitfeedback = [];
    this.done = [];
  }

  /**
  * Loads subtasks for each task and stores them in a lookup table by task ID.
  */
  loadSubtasks() {
    for (const task of this.taskList) {
      if (task.id) {
        this.taskService.getSubtasks(task.id).subscribe((subtasks) => {
          this.subtasksByTaskId[task.id!] = subtasks;
        });
      }
    }
  }

  /**
 * Returns the subtasks assigned to the currently selected task.
 *
 * @returns Array of subtasks, or an empty array if none are found.
 */
  getSubtasksForSelectedTask() {
    if (this.selectedTask?.id) {
      return this.subtasksByTaskId[this.selectedTask.id] || [];
    }
    return [];
  }

  /**
 * Returns the subtasks for a given task ID.
 *
 * @param taskId - The ID of the task to retrieve subtasks for.
 * @returns Array of subtasks, or an empty array if none exist.
 */
  getSubtasksForTask(taskId: string | undefined): Subtask[] {
    if (!taskId) {
      return [];
    }
    return this.subtasksByTaskId[taskId] || [];
  }

  /**
 * Updates the internal list of available contacts.
 *
 * @param contactList - Array of contact objects to store.
 */
  getContactList(contactList: Contact[]) {
    this.contactList = contactList;
  }

  /**
 * Replaces the subtask list with a new array of updated subtasks.
 *
 * @param updatedSubtasks - Array of updated subtask objects.
 */
  onSubtaskUpdate(updatedSubtasks: Subtask[]) {
    this.subtaskList = [...updatedSubtasks];
  }

  /**
 * TrackBy function for use with ngFor to optimize rendering of tasks.
 *
 * @param index - The index of the item in the array.
 * @param task - The task object.
 * @returns The unique task ID.
 */
  trackByTaskId(index: number, task: Task): string | undefined {
    return task.id;
  }

  /**
 * Updates the status of a task and persists the change via the task service.
 *
 * @param event - An object containing taskId and the new status.
 */
  changeTaskStatus(event: { taskId: string; status: string }) {
    const { taskId, status } = event;
    const task = this.taskList.find((t) => t.id === taskId);
    if (task && task.status !== status) {
      const updatedTask = { ...task, status };
      this.taskService.updateTask(taskId, updatedTask).then(() => {
        this.loadTasks();
      });
    }
  }

  /**
 * Handles automatic scrolling while dragging near the top or bottom edge
 * of the scrollable task section.
 *
 * @param event - The CdkDragMove event containing the pointer position.
 */
  onDragMoved(event: CdkDragMove) {
    const mouseY = event.pointerPosition.y;
    const threshold = 100;
    const scrollStep = 30;
    const section = this.scrollSection?.nativeElement;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (mouseY < rect.top + threshold) {
      section.scrollBy({ top: -scrollStep, behavior: 'auto' });
    } else if (rect.bottom - mouseY < threshold) {
      section.scrollBy({ top: scrollStep, behavior: 'auto' });
    }
  }
}
