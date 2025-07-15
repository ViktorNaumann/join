import {
  Component,
  ViewEncapsulation,
  HostListener,
  ViewChild,
  ElementRef,
  AfterViewInit,
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
      // ENTER: void => right
      transition('void => right', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      // LEAVE: right => void
      transition('right => void', [
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateX(100%)', opacity: 0 })
        ),
      ]),

      // ENTER: void => bottom
      transition('void => bottom', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      // LEAVE: bottom => void
      transition('bottom => void', [
        animate(
          '250ms ease-in-out',
          style({ transform: 'translateY(100%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
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

  constructor(
    private taskService: TaskService,
    private router: Router,
    private contactService: ContactService
  ) {}

  @ViewChild('scrollSection') scrollSection!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    // Optional: falls du initial prüfen willst
    this.scrollSection.nativeElement.addEventListener('scroll', () =>
      this.onSectionScroll()
    );
  }

  onSectionScroll() {
    const scrollTop = this.scrollSection.nativeElement.scrollTop;
    this.showBackToTop = scrollTop > 300;
  }

  scrollToTop() {
    this.scrollSection.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  onSearchInput() {}

  getFilteredTasks(status: string): Task[] {
    // Mapping für bessere Lesbarkeit
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

  private sortTasksByDueDate(tasks: Task[], ascending: boolean = true): Task[] {
    return [...tasks].sort((a, b) => {
      const dateA = this.getDateValue(a.date);
      const dateB = this.getDateValue(b.date);
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  private getDateValue(date: Date | any): number {
    if (date && typeof date.toDate === 'function') {
      // Firebase Timestamp
      return date.toDate().getTime();
    } else if (date instanceof Date) {
      return date.getTime();
    } else if (typeof date === 'string') {
      return new Date(date).getTime();
    }
    return Number.MAX_SAFE_INTEGER; // Tasks ohne Datum kommen ans Ende
  }

  clearSearch() {
    this.searchTerm = '';
  }

  setAnimationDirection(width: number) {
    this.animationDirection = width < 1000 ? 'bottom' : 'right';
  }

  removeBackground(event: string) {
    if (event === 'closed') {
      this.backgroundVisible = false;
      this.overlayVisible = false;
    }
  }

  onOverlayAnimationDone(event: AnimationEvent) {
    if (event.toState === 'right' || event.toState === 'bottom') {
      setTimeout(() => {
        this.backgroundVisible = true;
      }, 50);
    }
  }

  todo: Task[] = [];
  inprogress: Task[] = [];
  awaitfeedback: Task[] = [];
  done: Task[] = [];

  // NEU:
  getDragDelay(): number {
    return window.innerWidth < 1000 ? 250 : 0;
  }

  drop(event: CdkDragDrop<Task[]>) {
    const task = event.item.data as Task; // Task-Daten aus dem Drag-Event
    let newStatus: Task['status'];

    // Status basierend auf der Container-ID bestimmen
    if (event.container.id === 'todoList') {
      newStatus = 'to-do';
    } else if (event.container.id === 'inprogressList') {
      newStatus = 'in-progress';
    } else if (event.container.id === 'awaitfeedbackList') {
      newStatus = 'await-feedback';
    } else if (event.container.id === 'doneList') {
      newStatus = 'done';
    } else {
      return; // Fallback, falls Container unbekannt
    }

    // NEU:
    if (event.previousContainer === event.container) {
      // Innerhalb einer Liste verschieben
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Zwischen Listen verschieben
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // Status im Task-Objekt und Backend aktualisieren
      if (task.id && task.status !== newStatus) {
        const updatedTask: Task = { ...task, status: newStatus };
        this.taskService.updateTask(task.id, updatedTask).catch((error) => {
          console.error('Error updating task status:', error);
        });
      }
    }

    // Nach jedem Drop sortieren
    this.todo = this.sortTasksByDueDate(this.todo);
    this.inprogress = this.sortTasksByDueDate(this.inprogress);
    this.awaitfeedback = this.sortTasksByDueDate(this.awaitfeedback);
    this.done = this.sortTasksByDueDate(this.done);
  }

  saveTaskStatus(status: string) {
    this.setTaskStatus = status;
  }

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

  openTaskDetail(selectedTask: Task) {
    this.selectedTask = selectedTask;
    this.showTaskDetails = true;
    this.showAddOrEditTask = false;
    this.overlayVisible = true;
  }

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
      // Arrays nach Fälligkeitsdatum sortieren
      this.todo = this.sortTasksByDueDate(this.todo);
      this.inprogress = this.sortTasksByDueDate(this.inprogress);
      this.awaitfeedback = this.sortTasksByDueDate(this.awaitfeedback);
      this.done = this.sortTasksByDueDate(this.done);
      this.loadSubtasks();
    });
    return () => this.unsubTask.unsubscribe();
  }

  emptyArrays() {
    this.todo = [];
    this.inprogress = [];
    this.awaitfeedback = [];
    this.done = [];
  }

  loadSubtasks() {
    for (const task of this.taskList) {
      if (task.id) {
        this.taskService.getSubtasks(task.id).subscribe((subtasks) => {
          this.subtasksByTaskId[task.id!] = subtasks;
        });
      }
    }
  }

  getSubtasksForSelectedTask() {
    if (this.selectedTask?.id) {
      return this.subtasksByTaskId[this.selectedTask.id] || [];
    }
    return [];
  }

  getSubtasksForTask(taskId: string | undefined): Subtask[] {
    if (!taskId) {
      return [];
    }
    return this.subtasksByTaskId[taskId] || [];
  }

  getContactList(contactList: Contact[]) {
    this.contactList = contactList;
  }

  onSubtaskUpdate(updatedSubtasks: Subtask[]) {
    this.subtaskList = [...updatedSubtasks];
  }

  // Track-by-Funktion für bessere Performance hinzufügen
  trackByTaskId(index: number, task: Task): string | undefined {
    return task.id;
  }

  changeTaskStatus(event: { taskId: string; status: string }) {
    const { taskId, status } = event;
    const task = this.taskList.find((t) => t.id === taskId);
    if (task && task.status !== status) {
      const updatedTask = { ...task, status };
      this.taskService.updateTask(taskId, updatedTask).then(() => {
        // Optional: UI-Update, falls nötig
        this.loadTasks();
      });
    }
  }

  // NEU Window Drag-Scroll
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
