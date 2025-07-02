import { Component, EventEmitter, ViewEncapsulation, Input } from '@angular/core';
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

@Component({
  selector: 'app-board',
  imports: [
    TaskComponent,
    TaskDetailsComponent,
    CdkDropList,
    CdkDrag,
    CommonModule,
    FormsModule
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
  selectedTask?: Task;

  // NEU Suchfunktion
  searchTerm: string = '';
  searchResults: Task[] = [];
  showSearchResults: boolean = false;

  // Datenabruf
  unsubTask!: Subscription;
  unsubSubtask!: Subscription;
  unsubContact!: Subscription;
  category = 'technical'; //später dynamisch setzen
  taskList: Task[] = [];
  subtaskList: Subtask[] = [];
  subtaskForSelectedTask: Subtask[] = [];
  contactList: Contact[] = [];
  subtasksByTaskId: { [taskId: string]: Subtask[] } = {};

  constructor(private taskService: TaskService) {}

  // NEU: Suchfunktion
  onSearchInput() {
    if (this.searchTerm.trim().length > 0) {
      const searchLower = this.searchTerm.toLowerCase();
      this.searchResults = this.taskList.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) || // Suche im Titel
          task.description?.toLowerCase().includes(searchLower) // Suche in der Beschreibung
      );
      // this.showSearchResults = true;
    } else {
      // NEU: Wenn leer, alle Tasks anzeigen
      this.searchResults = [...this.taskList]

      // this.searchResults = [];
      // this.showSearchResults = false;
    }
    //NEU
    this.showSearchResults = true;
  }


  // NEU: Beim Focus alle Tasks anzeigen
  onSearchFocus() {
    if (this.searchTerm.trim().length === 0) {
      this.searchResults = [...this.taskList];
    } else {
      this.onSearchInput(); // Normale Suchlogik wenn bereits Text eingegeben
    }
    this.showSearchResults = true;
  }


  // NEU: Task aus Suchergebnissen auswählen
  selectTaskFromSearch(task: Task) {
    this.openTaskDetail(task);
    this.clearSearch();
  }

  // NEU: Suche zurücksetzen
  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  // NEU: Dropdown schließen beim Klick außerhalb
  onSearchBlur() {
    // Kleine Verzögerung, damit Click-Event auf Suchergebnis noch funktioniert
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
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
  }
  
  openEditOverlay(task: Task) {
    console.log('Edit task overlay opened for:', task);
  }

  openTaskDetail(selectedTask: Task) {
    console.log('Task selected in board:', selectedTask);
    this.selectedTask = selectedTask;
    this.backgroundVisible = true;
  }

  closeDetailsOverlay(event: string) {
    if (event === 'close') {
      this.backgroundVisible = false;
      console.log('Details overlay closed');
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
      this.taskService
        .getSubtasks(task.id)
        .subscribe((subtasks) => {
          this.subtasksByTaskId[task.id!] = subtasks;
        });
    }
  }
    return () => this.unsubSubtask.unsubscribe();
  }

  getSubtasks(subtaskList: Subtask[]) {
    this.subtaskForSelectedTask = subtaskList;
    console.log('Subtasks for selected task:', this.subtaskForSelectedTask);
  }
  //Zum Test
  getSubtasksForSelectedTask() {
    if (this.selectedTask?.id) {
      return this.subtasksByTaskId[this.selectedTask.id] || [];
    }
    return [];
  }

  getContactList(contactList: Contact[]) {
    this.contactList = contactList;
    console.log('Contacts for selected task:', this.contactList);
  }

  onSubtaskUpdate(updatedSubtasks: Subtask[]) {
  this.subtaskList = [...updatedSubtasks];

}
 }
