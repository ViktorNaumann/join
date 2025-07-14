import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../services/task.service';

@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  taskList: Task[] = []; // Variable zum speichern aller Tasks!

  todoCount = 0;
  doneCount = 0;
  inProgressCount = 0;
  awaitingFeedbackCount = 0;

  constructor(private taskService: TaskService) {}

  //NEU:
  private countTasksByStatus(tasks: Task[], status: string): number {
    return tasks.filter((t) => t.status === status).length;
  }

  // Getter-Method:
  get totalTaskCount(): number {
    return (
      this.todoCount +
      this.inProgressCount +
      this.awaitingFeedbackCount +
      this.doneCount
    );
  }

  //NEU:
  ngOnInit() {
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.taskList = tasks; // Hier alle Tasks speichern!
      this.todoCount = this.countTasksByStatus(tasks, 'to-do');
      this.doneCount = this.countTasksByStatus(tasks, 'done');
      this.inProgressCount = this.countTasksByStatus(tasks, 'in-progress');
      this.awaitingFeedbackCount = this.countTasksByStatus(
        tasks,
        'await-feedback'
      );
    });
  }

  // ngOnInit() {
  //   this.taskService.getTasks().subscribe((tasks: Task[]) => {
  //     this.todoCount = tasks.filter((t) => t.status === 'to-do').length;
  //     this.doneCount = tasks.filter((t) => t.status === 'done').length;
  //     this.inProgressCount = tasks.filter(
  //       (t) => t.status === 'in-progress'
  //     ).length;
  //     this.awaitingFeedbackCount = tasks.filter(
  //       (t) => t.status === 'await-feedback'
  //     ).length;
  //   });
  // }
}
