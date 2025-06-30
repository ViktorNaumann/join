import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-task-details',
  imports: [
    CommonModule
  ],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent {
  showContent = true;
  category ='technical'; //später dynamisch setzen

  onClose() {
    console.log('Close button clicked');
    this.showContent = false;
  }
}
