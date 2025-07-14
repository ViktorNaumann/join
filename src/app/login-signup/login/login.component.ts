import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { LoginHeaderComponent } from '../login-header/login-header.component';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  group
} from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    LoginHeaderComponent,
    FooterComponent,
    CommonModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('fadeOutWrapper', [
      state('start', style({
        opacity: 1
      })),
      state('moved', style({
        opacity: 0
      })),
      transition('start => moved', [
        animate('1.5s 0.5s ease-in-out')
      ])
    ])
  ]
})
export class LoginComponent {
  logoState: 'start' | 'moved' = 'start';
  pageLoaded = false;

  ngOnInit(): void {
    if (!sessionStorage.getItem('logoMoved')) {
      setTimeout(() => {
        this.pageLoaded = true;
        this.logoState = 'moved';
        sessionStorage.setItem('logoMoved', 'true');
      }, 100);
    } else {
      this.logoState = 'moved';
    }
  }
}
