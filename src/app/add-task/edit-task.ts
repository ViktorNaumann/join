import { Injectable } from '@angular/core';
import { Contact, ContactService } from '../services/contact.service';
import { TaskService, Task } from '../services/task.service';
// import { AddTaskComponent } from './add-task.component';

/**
 * EditTask handles all task-related editing operations for the AddTaskComponent.
 */
@Injectable({
  providedIn: 'root'
})
export class EditTask {
    isEditingMode: boolean = false;
    editingTaskId: string | undefined;
    
    constructor(
        private contactService: ContactService,
        private taskService: TaskService,
        // public addTaskManager: AddTaskComponent
    ) {}

   /**
  * Loads a task currently being edited from the TaskService and
  * populates the form with its data. Clears managers if no task is loaded.
  */
   loadEditingTask(
    populateFormWithTaskData: (task: Task) => void,
    clearAllManagers: () => void
  ): void {
    const editingTask = this.taskService.getEditingTask();

    if (editingTask) {
      this.isEditingMode = true;
      this.editingTaskId = editingTask.id;
      populateFormWithTaskData(editingTask);
      this.taskService.clearEditingTask();
    } else {
      clearAllManagers();
    }
  }
}
