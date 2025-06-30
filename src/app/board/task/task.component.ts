import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ContactService } from '../../services/contact.service';

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
}
