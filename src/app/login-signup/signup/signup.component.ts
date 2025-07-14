import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


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

  constructor(private form: FormBuilder, ) {}

  ngOnInit(): void {
    this.signupform = this.form.group({
      name : ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>\/?]).+$/)  //8-Zeichen langes Passwort min. 1 Großbuchstabe, 1 Zahle & 1 Sonderzeichen -> maybe kleine Info-i mit was muss passwort haben
        ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator }
    );

  }

  //sogenannte cross-field-validator, check ob passwörter identisch sind
  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsDontMatch: true };
  }

  onSubmit(): void {
    if (this.signupform.invalid) {
      this.signupform.markAllAsTouched();
      return;
    }
    console.log('Signup data:', this.signupform.value);
  }

  getValidationMessage(field: string): string {
    const control = this.signupform.get(field);
    if (!control || !control.touched || !control.errors) return '';
    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['pattern']) {
      return 'Password must contain uppercase, number, and special character';
    }
    if (field === 'confirmPassword' && this.signupform.errors?.['passwordsDontMatch']) {
      return 'Passwords do not match';
    }
    return '';
  }

}
