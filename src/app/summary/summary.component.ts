import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

interface FirestoreTimestamp {
  toDate(): Date;
}

@Component({
  selector: 'app-summary',
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  animations: [
    trigger('fadeOutGreeting', [
      state('start', style({ opacity: 1 })),
      state('moved', style({ opacity: 0 })),
      transition('start => moved', [animate('1.5s 0.5s ease-in-out')]),
    ]),
  ],
})
export class SummaryComponent implements OnInit {
  taskList: Task[] = []; // Variable zum speichern aller Tasks!
  userName: string = '';

  greetingState: 'start' | 'moved' = 'start';
  showGreeting = true;
  isMobile = false;

  nextDeadlineDate: Date | null = null;
  nextDeadlineCount: number = 0;
  greeting: string = '';

  todoCount = 0;
  doneCount = 0;
  inProgressCount = 0;
  awaitingFeedbackCount = 0;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private authService: AuthService
  ) {}

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

  // Methode Uhrzeit
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

  ngOnInit() {
    this.isMobile = window.innerWidth < 1000; // Mobile Ansicht Pixelbreite!

    this.authService.getCurrentUserData().then((userData) => {
      // Login als Guest:
      this.userName = userData?.displayName?.trim()
        ? userData.displayName
        : 'Nice to see you!';
      this.greeting = this.getGreeting();

      // Animation und Anzeige erst starten, wenn beides gesetzt ist
      if (this.isMobile) {
        this.showGreeting = true;
        this.greetingState = 'start';
        setTimeout(() => {
          this.greetingState = 'moved';
          setTimeout(() => {
            this.showGreeting = false;
          }, 2000);
        }, 500);
      } else {
        this.showGreeting = false;
      }
    });

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
}
