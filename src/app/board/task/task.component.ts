import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../services/contact.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../services/task.service';
import { Subtask } from '../../services/task.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task',
  imports: [
    CommonModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {
  unsubTask!: Subscription;
  unsubSubtask!: Subscription;
  unsubContact!: Subscription;
  category ='technical'; //später dynamisch setzen
  taskList: Task[] = [];
  subtaskList: Subtask[] = [];
  contactList: Contact[] = [];

  constructor(public taskService: TaskService){}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.unsubTask = this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.taskList = tasks;
      console.log('Tasks loaded:', this.taskList);
      this.loadSubtasks();
    });
    return () => this.unsubTask.unsubscribe();
  }
 //um Subtasks zu laden, braucht man die Id der zugehörigen Task
  loadSubtasks() {
    for (const task of this.taskList) {
      if (task.id) {
        this.unsubSubtask = this.taskService.getSubtasks(task.id).subscribe(subtasks => {
          this.subtaskList = subtasks;
          console.log(`Subtasks für ${task.title}:`, subtasks);
          console.log(subtasks.length)
          console.log(subtasks[0].isCompleted)
        });
      }
    };
    return() => this.unsubSubtask.unsubscribe();
  }
  
  getCompletedSubtasksCount(subtaskList: any[]): number {
    return Array.isArray(subtaskList) ? subtaskList.filter(el => el.isCompleted).length : 0;
  }
}
