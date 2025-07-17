import { Injectable, ElementRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragMove } from '@angular/cdk/drag-drop';
import { Task, TaskService } from '../services/task.service';

/**
 * DragDropManager handles all drag-and-drop operations for the BoardComponent.
 * This includes drag delays, drop handling, auto-scrolling, and task status updates.
 */
@Injectable({
  providedIn: 'root'
})
export class DragDropManager {
  constructor(private taskService: TaskService) {}

  /**
   * Returns the delay for starting a drag action based on screen width.
   * Prevents accidental drags on small screens.
   *
   * @returns Drag delay in milliseconds.
   */
  getDragDelay(): number {
    return window.innerWidth < 1000 ? 250 : 0;
  }

  /**
   * Handles drag-and-drop actions for tasks using the Angular CDK.
   * Updates the task's status and reorders task lists accordingly.
   *
   * @param event - The CdkDragDrop event containing task data and drop context.
   * @param updateCallback - Callback function to update task lists after drop.
   */
  handleDrop(event: CdkDragDrop<Task[]>, updateCallback: () => void): void {
    const task = event.item.data as Task;
    let newStatus: Task['status'];
    
    if (event.container.id === 'todoList') {
      newStatus = 'to-do';
    } else if (event.container.id === 'inprogressList') {
      newStatus = 'in-progress';
    } else if (event.container.id === 'awaitfeedbackList') {
      newStatus = 'await-feedback';
    } else if (event.container.id === 'doneList') {
      newStatus = 'done';
    } else {
      return;
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
      if (task.id && task.status !== newStatus) {
        const updatedTask: Task = { ...task, status: newStatus };
        this.taskService.updateTask(task.id, updatedTask).catch((error) => {
          console.error('Error updating task status:', error);
        });
      }
    }
    updateCallback();
  }

  /**
   * Handles automatic scrolling while dragging near the top or bottom edge
   * of the scrollable task section.
   *
   * @param event - The CdkDragMove event containing the pointer position.
   * @param scrollSection - The scrollable section element reference.
   */
  handleDragMove(event: CdkDragMove, scrollSection: ElementRef<HTMLElement>): void {
    const mouseY = event.pointerPosition.y;
    const threshold = 100;
    const scrollStep = 30;
    const section = scrollSection?.nativeElement;
    
    if (!section) return;
    
    const rect = section.getBoundingClientRect();
    if (mouseY < rect.top + threshold) {
      section.scrollBy({ top: -scrollStep, behavior: 'auto' });
    } else if (rect.bottom - mouseY < threshold) {
      section.scrollBy({ top: scrollStep, behavior: 'auto' });
    }
  }

  /**
   * Updates the status of a task and persists the change via the task service.
   *
   * @param taskId - The ID of the task to update.
   * @param status - The new status for the task.
   * @param taskList - The current task list to find the task in.
   * @param reloadCallback - Callback function to reload tasks after update.
   */
  changeTaskStatus(
    taskId: string, 
    status: string, 
    taskList: Task[], 
    reloadCallback: () => void
  ): void {
    const task = taskList.find((t) => t.id === taskId);
    if (task && task.status !== status) {
      const updatedTask = { ...task, status };
      this.taskService.updateTask(taskId, updatedTask).then(() => {
        reloadCallback();
      });
    }
  }
}
