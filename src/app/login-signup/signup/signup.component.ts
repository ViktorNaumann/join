import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Contact, ContactService } from '../../services/contact.service';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent,
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})

export class SignupComponent implements OnInit {
  signupform!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private form: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private contactService: ContactService,
  ) {}

  ngOnInit(): void {
    this.signupform = this.form.group({
      name : ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>\/?]).+$/)  //8-Zeichen langes Passwort min. 1 Großbuchstabe, 1 Zahle & 1 Sonderzeichen -> maybe kleine Info-i mit was muss passwort haben
        ]],
      confirmPassword: ['', Validators.required],
      privacyPolicy: [false, [Validators.requiredTrue]],
      }, { validators: this.passwordsMatchValidator }
    );
  }

  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsDontMatch: true };
  }

  async onSubmit(): Promise<void> {
    if (this.signupform.invalid) {
      this.signupform.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { name, email, password } = this.signupform.value;
    const result = await this.authService.signUp(email, password, name);
    this.saveNewContact(name, email);

    if (result.success) {
      this.successMessage = 'Registration successful! You will be redirected...';
      setTimeout(() => {
        this.router.navigate(['/summary']);
      }, 2000);
    } else {
      this.errorMessage = result.message || 'Registration failed';
    }

    this.isLoading = false;
  }

  saveNewContact(newName:string, newEmail:string){
    const newContact: Contact = {
      name: newName,
      email: newEmail,
    }
    this.contactService.addContact(newContact)
    this.contactService.selectContact(newContact)
  }

  onBackToLogin(): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/login']);
    });
    this.isLoading = false;
  }

  getValidationMessage(field: string): string {
    const control = this.signupform.get(field);
    if (field === 'confirmPassword') {
      const passwordMismatch = this.signupform.errors?.['passwordsDontMatch'];
      const touched = control?.touched || this.signupform.get('password')?.touched;
      if (passwordMismatch && touched) {
        return 'Passwords do not match';
      }
    }
    if (!control || !control.touched || !control.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    }
    if (control.errors['pattern']) {
      return 'Password must contain uppercase, numbers and special characters';
    }
    if (control.errors['requiredTrue']) return 'You must accept the privacy policy';
    return '';
  }



}
