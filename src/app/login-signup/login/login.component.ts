import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { LoginHeaderComponent } from '../login-header/login-header.component';

@Component({
  selector: 'app-login',
  imports: [
    LoginHeaderComponent,
    FooterComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

}
