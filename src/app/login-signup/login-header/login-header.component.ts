import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';


@Component({
  selector: 'app-login-header',
  imports: [
    RouterModule,
  ],
  templateUrl: './login-header.component.html',
  styleUrl: './login-header.component.scss',
  animations: [
    trigger('fadeOut', [
      state('start', style({
        opacity: 0
      })),
      state('appear', style({
        opacity: 1
      })),
      transition('start => appear', [
        animate('2s 0.7s ease-in-out')
      ])
    ])
  ]
})
export class LoginHeaderComponent {
  logoState: 'start' | 'appear' = 'start';
  isTouchDevice:boolean = false;

  ngOnInit(): void {
    this.initializeAnimation();
  } 

  initializeAnimation() {
    if (!sessionStorage.getItem('logoAppeared')) {
      setTimeout(() => {
        this.logoState = 'appear';
        sessionStorage.setItem('logoAppeared', 'true');
      }, 100);
    } else {
      this.logoState = 'appear';
    }
  }
}

