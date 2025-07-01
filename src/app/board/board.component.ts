import { Component, ViewEncapsulation } from '@angular/core';
import { TaskComponent } from './task/task.component';
import {trigger, state, style,transition,animate, AnimationEvent } from '@angular/animations';
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

@Component({
  selector: 'app-board',
  imports: [
    TaskComponent,
    TaskDetailsComponent,
    CdkDropList, 
    CdkDrag,
    CommonModule
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

  constructor(private taskService: TaskService) {}
  
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
    }  // Test-Daten für die Drag & Drop Funktionalität
  todo:string[] = ['Task 1', 'Task 2'];
  inprogress: string[] = [];
  awaitfeedback: string[] = [];
  done: string[] = [];

  drop(event: CdkDragDrop<string[]>) {
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
    }
  }

  openTaskDetail(selectedTask: Task) {
    console.log('Task selected in board:', selectedTask);
    this.backgroundVisible = true;
  }

  closeDetailsOverlay(event: string) {
    if (event === 'close') {
      this.backgroundVisible = false;
      console.log('Details overlay closed');
    }
  }
 }
