import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../services/contact.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../services/task.service';
import { Subtask } from '../../services/task.service';
// import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task',
  imports: [
    CommonModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {
  // unsubTask!: Subscription;
  // unsubSubtask!: Subscription;
  // unsubContact!: Subscription;
  // category ='technical'; //später dynamisch setzen
  // taskList: Task[] = [];
  // subtaskList: Subtask[] = [];
  // contactList: Contact[] = [];
  @Input() task!: Task;
  @Input() subtaskList: Subtask[] = [];
  @Output() taskSelected = new EventEmitter<Task>();
  @Output() subtaskForSelectedTask = new EventEmitter<Subtask[]>();
  seletectedTask?: Task;

  constructor(public taskService: TaskService, public contactService: ContactService){}

  ngOnInit(): void {
    // this.loadTasks();

  }

//   loadTasks() {
//     this.unsubTask = this.taskService.getTasks().subscribe((tasks: Task[]) => {
//       this.taskList = tasks;
//       console.log('Tasks loaded:', this.taskList);
//       this.loadSubtasks();
//     });
//     return () => this.unsubTask.unsubscribe();
//   }
//  //um Subtasks zu laden, braucht man die Id der zugehörigen Task
//   loadSubtasks() {
//     for (const task of this.taskList) {
//       if (task.id) {
//         this.unsubSubtask = this.taskService.getSubtasks(task.id).subscribe(subtasks => {
//           this.subtaskList = subtasks;
//           console.log(`Subtasks für ${task.title}:`, subtasks);
//           console.log(subtasks.length)
//           console.log(subtasks[0].isCompleted)
//         });
//       }
//     };
//     return() => this.unsubSubtask.unsubscribe();
//   }

  getCompletedSubtasksCount(subtaskList: any[]): number {
    return Array.isArray(subtaskList) ? subtaskList.filter(el => el.isCompleted).length : 0;
  }

  openTaskDetails(task: Task) {
    this.seletectedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.date,
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo,
      category: task.category,
      subtask: task.subtask,
    }   
    // No need to assign subtaskList as an object, keep it as an array
    this.taskSelected.emit(this.seletectedTask);
    this.subtaskForSelectedTask.emit(this.subtaskList);
    console.log('Selected Task emitted:', this.seletectedTask);
  }
}
