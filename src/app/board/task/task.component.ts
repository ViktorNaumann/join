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
  seletectedTask?: Task;

  constructor(public taskService: TaskService, public contactService: ContactService){}

  ngOnInit(): void {
    this.getContactList();
  }

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
    this.taskSelected.emit(this.seletectedTask);
    this.subtaskForSelectedTask.emit(this.subtaskList);
    console.log('Selected Task emitted:', this.seletectedTask);
  }

  //NEU - Kontakte anhand der IDs aus den Tasks geladen
  async getContactList() {
    if (this.task?.assignedTo?.length) {
      for (let contactId of this.task.assignedTo) {
        const contact = await this.contactService.getContactById(contactId);
        if (contact) this.contactList.push(contact);
        this.contacts.emit(this.contactList);
        console.log('Das sind die Kontakte:', this.contactList);
      }
    }
  }
}
