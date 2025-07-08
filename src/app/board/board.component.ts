import {
  Component,
  EventEmitter,
  ViewEncapsulation,
  Input,
} from '@angular/core';
import { TaskComponent } from './task/task.component';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationEvent,
} from '@angular/animations';
import { Observable } from 'rxjs';
import { TaskDetailsComponent } from './task-details/task-details.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { Task } from '../services/task.service';
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';

// Datenabruf
import { Subtask } from '../services/task.service';
import { Subscription } from 'rxjs';
import { ContactService } from '../services/contact.service';
import { Contact } from '../services/contact.service';

// NEU - Suchfunktion
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
  backgroundVisible = false; //später wieder false setzen
  showTaskDetails = false;
  showAddOrEditTask: boolean = false; //später wieder false setzen
  selectedTask?: Task;
  // Suchfunktion
  searchTerm: string = '';

  // Datenabruf
  unsubTask!: Subscription;
  unsubSubtask!: Subscription;
  unsubContact!: Subscription;
  // category = 'technical'; //später dynamisch setzen
  taskList: Task[] = [];
  subtaskList: Subtask[] = [];
  // subtaskForSelectedTask: Subtask[] = [];
  contactList: Contact[] = [];
  subtasksByTaskId: { [taskId: string]: Subtask[] } = {};
  setTaskStatus: string = 'to-do';

  constructor(private taskService: TaskService, private router: Router) {}

  // Suchfunktion (geändert)
  onSearchInput() {}

  // Filterung aus sortierten Arrays
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

  // Erweiterte Sortier-Methode mit verschiedenen Optionen
  private sortTasksByDueDate(tasks: Task[], ascending: boolean = true): Task[] {
    return tasks.sort((a, b) => {
      const dateA = this.getDateValue(a.date);
      const dateB = this.getDateValue(b.date);

      if (ascending) {
        return dateA - dateB; // Nächstes Datum zuerst
      } else {
        return dateB - dateA; // Spätestes Datum zuerst
      }
    });
  }

  // NEU: Hilfsmethode um Date-Werte zu extrahieren (Firebase Timestamp oder Date)
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
    }
  }

  onOverlayAnimationDone(event: AnimationEvent) {
    if (event.toState === 'right' || event.toState === 'bottom') {
      setTimeout(() => {
        this.backgroundVisible = true;
      }, 50);
    }
  } // Test-Daten für die Drag & Drop Funktionalität

  // NEU Typen für drag&drop zu Task[] geändert
  todo: Task[] = [];
  inprogress: Task[] = [];
  awaitfeedback: Task[] = [];
  done: Task[] = [];

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

      // Status in Firebase aktualisieren
      if (task.id && task.status !== newStatus) {
        const updatedTask: Task = { ...task, status: newStatus };
        this.taskService
          .updateTask(task.id, updatedTask)
          .then(() => {
            console.log(
              `Task "${task.title}" status updated to "${newStatus}"`
            );
          })
          .catch((error) => {
            console.error('Error updating task status:', error);
          });
      }
    }

    // Nach dem Drop die betroffenen Arrays neu sortieren
    if (event.previousContainer !== event.container) {
      // Arrays neu sortieren nach Status-Änderung
      this.todo = this.sortTasksByDueDate(this.todo);
      this.inprogress = this.sortTasksByDueDate(this.inprogress);
      this.awaitfeedback = this.sortTasksByDueDate(this.awaitfeedback);
      this.done = this.sortTasksByDueDate(this.done);
    }
  }

  saveTaskStatus(status: string) {
    this.setTaskStatus = status;
  }

  openAddOrEditOverlay(event:string, status:string) {
    const isSmallScreen = window.innerWidth < 1000;
    if (event === 'open') {
      if (isSmallScreen) {
        this.router.navigate(['/add-task'], { queryParams: { status } }); // oder z.B. /add-task
      } else {
        this.selectedTask = undefined;
        this.showTaskDetails = false;
        this.showAddOrEditTask = true;
      }
    } else if (event === 'edit') {
      if (isSmallScreen) {
        this.router.navigate(['/add-task'], { queryParams: { status } }); // oder z.B. /add-task
      } else {
        // selectedTask NICHT auf undefined setzen, damit sie an Add-Task weitergegeben werden kann
        this.showTaskDetails = false;
        this.showAddOrEditTask = true;
      }
      
  }
  this.backgroundVisible = true;
}

   openTaskDetail(selectedTask: Task) {
    console.log('Task selected in board:', selectedTask);
    this.selectedTask = selectedTask;
    this.showTaskDetails = true;
    this.showAddOrEditTask = false;
    this.backgroundVisible = true;
}

  closeDetailsOverlay(event: string) {
   if(event === 'close' || 'added') {
    this.backgroundVisible = false;
    this.showTaskDetails = false;
    this.showAddOrEditTask = false;
    this.selectedTask = undefined;
    this.taskService.clearEditingTask();
   }
  }



  //NEU für Datenabruf

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.unsubTask = this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.taskList = tasks;
      // Arrays leeren
      this.todo = [];
      this.inprogress = [];
      this.awaitfeedback = [];
      this.done = [];
      console.log('Tasks loaded:', this.taskList);

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

      // NEU: Arrays nach Fälligkeitsdatum sortieren
      this.todo = this.sortTasksByDueDate(this.todo);
      this.inprogress = this.sortTasksByDueDate(this.inprogress);
      this.awaitfeedback = this.sortTasksByDueDate(this.awaitfeedback);
      this.done = this.sortTasksByDueDate(this.done);

      this.loadSubtasks();
    });
    return () => this.unsubTask.unsubscribe();
  }
  //um Subtasks zu laden, braucht man die Id der zugehörigen Task
  loadSubtasks() {
    // for (const task of this.taskList) {
    //   if (task.id) {
    //     this.unsubSubtask = this.taskService
    //       .getSubtasks(task.id)
    //       .subscribe((subtasks) => {
    //         this.subtaskList = subtasks;
    //         console.log(`Subtasks für ${task.title}:`, subtasks);
    //         console.log(subtasks.length);
    //         console.log(subtasks[0].isCompleted);
    //       });
    //   }
    // }
    for (const task of this.taskList) {
      if (task.id) {
        this.taskService.getSubtasks(task.id).subscribe((subtasks) => {
          this.subtasksByTaskId[task.id!] = subtasks;
          console.log(`Subtasks für ${task.title}:`, subtasks);
        });
      }
    }
  }

  // getSubtasks(subtaskList: Subtask[]) {
  //   this.subtaskForSelectedTask = subtaskList;
  //   console.log('Subtasks for selected task:', this.subtaskForSelectedTask);
  // }
  //Zum Test
  getSubtasksForSelectedTask() {
    if (this.selectedTask?.id) {
      return this.subtasksByTaskId[this.selectedTask.id] || [];
    }
    return [];
  }

  // NEU: Methode um Subtasks für eine bestimmte Task zu bekommen
  getSubtasksForTask(taskId: string | undefined): Subtask[] {
    if (!taskId) {
      return [];
    }
    return this.subtasksByTaskId[taskId] || [];
  }

  getContactList(contactList: Contact[]) {
    this.contactList = contactList;
    console.log('Contacts for selected task:', this.contactList);
  }

  onSubtaskUpdate(updatedSubtasks: Subtask[]) {
    this.subtaskList = [...updatedSubtasks];
  }

  // TEST
  // Track-by-Funktion für bessere Performance hinzufügen
trackByTaskId(index: number, task: Task): string | undefined {
  return task.id;
}
}
