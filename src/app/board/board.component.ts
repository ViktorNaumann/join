import { Component } from '@angular/core';
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

@Component({
  selector: 'app-board',
  imports: [
    TaskComponent,
    TaskDetailsComponent,
    CdkDropList, 
    CdkDrag],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
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
  todo:string[] = ['Task 1', 'Task 2', 'Task 3'];
  inprogress: string[] = ['Completed Task 1'];
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
}
