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
  contactList: Contact[] = [];
  @Input() task!: Task;
  @Input() subtaskList: Subtask[] = [];
  @Output() taskSelected = new EventEmitter<Task>();
  @Output() subtaskForSelectedTask = new EventEmitter<Subtask[]>();
  @Output() contacts = new EventEmitter<Contact[]>();
  selectedTask?: Task;

  constructor(public taskService: TaskService, public contactService: ContactService){}

  ngOnInit(): void {
    this.getContactList();
  }

  getCompletedSubtasksCount(subtaskList: any[]): number {
    return Array.isArray(subtaskList) ? subtaskList.filter(el => el.isCompleted).length : 0;
  }

  percentageCompleted(subtaskList: Subtask[]): number {
    if (!subtaskList || subtaskList.length === 0) return 0;
    const completed = this.getCompletedSubtasksCount(subtaskList);
    return Math.round((completed / subtaskList.length) * 100);
  }

  openTaskDetails(task: Task) {
    this.selectedTask = task; 
    this.taskSelected.emit(this.selectedTask);
    this.subtaskForSelectedTask.emit(this.subtaskList);
    console.log('Selected Task emitted:', this.selectedTask);
  }

  //NEU - Kontakte anhand der IDs aus den Tasks geladen
  async getContactList() {
    if (this.task?.assignedTo?.length) {
      for (let contactId of this.task.assignedTo) {
        const contact = await this.contactService.getContactById(contactId);
        if (contact) this.contactList.push(contact);
        console.log('Das sind die Kontakte:', this.contactList);
      }
       this.contacts.emit(this.contactList);
    }
  }
}
