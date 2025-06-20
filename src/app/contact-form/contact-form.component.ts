import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService, Contact } from '../services/contact.service';

@Component({
  selector: 'app-contact-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent {
  contactForm!: FormGroup;

  constructor(private form: FormBuilder, private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactForm = this.form.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.min(10)]]
    });
  }

  onSave(){
    console.log(this.contactForm.value);
    let newContact: Contact = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      phone: this.contactForm.value.phone
    }

    this.contactService.addContact(newContact)
  }
}
