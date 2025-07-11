import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-signup',
  imports: [
    FooterComponent
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupform!: FormGroup;

  constructor(private form: FormBuilder, ) {}

  ngOnInit(): void {
    this.signupform = this.form.group({
      username : ['', ],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: [],
      password: [],

    })
  }
}
