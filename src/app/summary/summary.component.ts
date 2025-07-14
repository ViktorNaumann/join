import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// NEU:
interface FirestoreTimestamp {
  toDate(): Date;
}

@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
})
export class SummaryComponent implements OnInit {
  taskList: Task[] = []; // Variable zum speichern aller Tasks!

  // NEU
  nextDeadlineDate: Date | null = null;
  // nextDeadlineTask: Task | null = null; //Kann die Variable weg?
  nextDeadlineCount: number = 0;
  greeting: string = '';

  todoCount = 0;
  doneCount = 0;
  inProgressCount = 0;
  awaitingFeedbackCount = 0;

  constructor(private taskService: TaskService, private router: Router) {}

  //NEU:
  private countTasksByStatus(tasks: Task[], status: string): number {
    return tasks.filter((t) => t.status === status).length;
  }

  private isFirestoreTimestamp(obj: any): obj is FirestoreTimestamp {
    return obj && typeof obj.toDate === 'function';
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

  // Neue Methode Uhrzeit
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning,';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon,';
    } else if (hour >= 18 && hour < 23) {
      return 'Good evening,';
    } else {
      return 'Good night,';
    }
  }

  goToBoard() {
    this.router.navigate(['/board']);
  }

  //NEU:
  ngOnInit() {
    this.greeting = this.getGreeting(); // NEU

    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      this.taskList = tasks; // Hier alle Tasks speichern!

      this.todoCount = this.countTasksByStatus(tasks, 'to-do');
      this.doneCount = this.countTasksByStatus(tasks, 'done');
      this.inProgressCount = this.countTasksByStatus(tasks, 'in-progress');
      this.awaitingFeedbackCount = this.countTasksByStatus(
        tasks,
        'await-feedback'
      );

      const now = new Date();
      const futureTasks = tasks
        .filter((t) => t.date && t.status !== 'done') // Status-Check
        .map((t) => {
          let dateObj: Date | null = null;
          if (t.date instanceof Date) {
            dateObj = t.date;
          } else if (this.isFirestoreTimestamp(t.date)) {
            dateObj = t.date.toDate();
          } else if (typeof t.date === 'string' || typeof t.date === 'number') {
            dateObj = new Date(t.date);
          }
          return { ...t, dateObj };
        })
        .filter((t) => t.dateObj && t.dateObj > now);

      if (futureTasks.length > 0) {
        futureTasks.sort((a, b) => a.dateObj!.getTime() - b.dateObj!.getTime());
        const nextDate = futureTasks[0].dateObj!;
        this.nextDeadlineDate = nextDate;
        this.nextDeadlineCount = futureTasks.filter(
          (t) => t.dateObj!.getTime() === nextDate.getTime()
        ).length;
      } else {
        this.nextDeadlineDate = null;
        this.nextDeadlineCount = 0;
      }
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
