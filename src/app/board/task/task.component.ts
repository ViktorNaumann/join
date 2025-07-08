import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../services/contact.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../services/task.service';
import { Subtask } from '../../services/task.service';

@Component({
  selector: 'app-task',
  imports: [
    CommonModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent {

  contactList: Contact[] = [];
  @Input() task!: Task;
  @Input() subtaskList: Subtask[] = [];
  @Output() taskSelected = new EventEmitter<Task>();
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
  }

  async getContactList() {
    if (this.task?.assignedTo?.length) {
      for (let contactId of this.task.assignedTo) {
        const contact = await this.contactService.getContactById(contactId);
        if (contact) this.contactList.push(contact);
      }
       this.contacts.emit(this.contactList);
    }
  }
  
  getRemainingContactNames(remainingContacts: Contact[]): string {
    return remainingContacts.map(contact => contact.name).join(', ');
  }
}
