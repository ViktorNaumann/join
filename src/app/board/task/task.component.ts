import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../services/task.service';

@Component({
  selector: 'app-task',
  imports: [
    CommonModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {
  category ='technical'; //später dynamisch setzen
  tasks: Task[] = [];

  constructor(public taskService: TaskService){}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      console.log('Tasks loaded:', this.tasks);
    });
  }

}
