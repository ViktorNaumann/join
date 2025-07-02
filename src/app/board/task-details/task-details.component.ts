import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Task, TaskService } from '../../services/task.service';
import { Subtask } from '../../services/task.service';
import { Timestamp } from '@angular/fire/firestore';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../services/contact.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-details',
  imports: [
    CommonModule
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent {
  @Output() closeTaskDetails = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  @Input() task!: Task;
  @Input() subtask!: Subtask[];
  @Input() contactList: Contact[] = [];
  showContent = true;
  
  constructor(private taskService: TaskService, public contactService: ContactService, private router: Router ) {}

  onClose() {
    console.log('Close button clicked');
    this.showContent = false;
    this.closeTaskDetails.emit('close');
  }

  convertDate(date: Timestamp | Date): string {
    return this.taskService.convertDate(date);
 }

  openEditTask() {
    console.log('Edit button clicked', this.task);
    // *Task im Service für das Bearbeiten speichern
    this.taskService.setEditingTask(this.task);
    // *Zu add-task navigieren
    this.router.navigate(['/add-task']);
    this.editTask.emit(this.task);
   }

  deleteTask() {
    if(this.task.id) {
      this.taskService.deleteTask(this.task.id);
      this.onClose();
    }
  }
}
