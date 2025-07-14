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

@Component({
  selector: 'app-login',
  imports: [
    LoginHeaderComponent,
    FooterComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('moveLogo', [
      state('start', style({
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 1
      })),
      state('moved', style({
        top: '0px',
        left: '0px',
        transform: 'translate(0, 0)',
        opacity: 0
      })),
      transition('start => moved', [
        group([
          animate('2s ease-in-out', style({
            top: '0',
            left: '0',
            transform: 'translate(0, 0)'
          })),
          animate('1s 0.5s ease-in-out', style({ opacity: 0 }))
        ])
      ])
    ]),
    trigger('fadeOutWrapper', [
      state('start', style({
        opacity: 1
      })),
      state('moved', style({
        opacity: 0
      })),
      transition('start => moved', [
        animate('2.5s 0.5s ease-in-out')
      ])
    ])
  ]
})
export class LoginComponent {
  logoState: 'start' | 'moved' = 'start';

  ngOnInit(): void {
    if (!sessionStorage.getItem('logoMoved')) {
      setTimeout(() => {
        this.logoState = 'moved';
        sessionStorage.setItem('logoMoved', 'true');
      }, 100);
    } else {
      this.logoState = 'moved';
    }
  }
}
