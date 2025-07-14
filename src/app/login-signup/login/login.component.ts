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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    LoginHeaderComponent,
    FooterComponent,
    CommonModule,
    ReactiveFormsModule,
    RouterModule
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
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeAnimation();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private initializeAnimation(): void {
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

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;
    const result = await this.authService.signIn(email, password);

    if (result.success) {
      this.router.navigate(['/summary']);
    } else {
      this.errorMessage = result.message || 'Login failed';
    }

    this.isLoading = false;
  }

  async onGuestLogin(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    const result = await this.authService.signInAsGuest();

    if (result.success) {
      this.router.navigate(['/summary']);
    } else {
      this.errorMessage = result.message || 'Guest login failed';
    }

    this.isLoading = false;
  }

  getValidationMessage(field: string): string {
    const control = this.loginForm.get(field);
    if (!control || !control.touched || !control.errors) return '';
    
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength']) return 'Password must be at least 6 characters long';
    
    return '';
  }
}
