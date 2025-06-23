import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService, Contact } from '../services/contact.service';
import { notOnlyWhitespace } from '../services/contact.service';

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
  @Input() contactToEdit?: Contact;

  constructor(private form: FormBuilder, private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactForm = this.form.group({
      name: ['', [Validators.required, notOnlyWhitespace]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.min(10), Validators.pattern(/^\d+$/)]]
    });
    if (this.contactToEdit) { //Anzeigen der Daten im Inputfeld
    this.contactForm.patchValue({
      name: this.contactToEdit.name,
      email: this.contactToEdit.email,
      phone: this.contactToEdit.phone
    });
  }
  }

  onSubmit(){
    if(this.contactForm.valid){
      if(this.contactToEdit?.id) {
        let editContact: Contact = {
          name: this.contactForm.value.name.trim(),
          email: this.contactForm.value.email.trim(),
          phone: this.contactForm.value.phone.trim()
        }
        this.contactService.updateContact(this.contactToEdit.id, editContact);
      } else {
      let newContact: Contact = {
      name: this.contactForm.value.name.trim(),
      email: this.contactForm.value.email.trim(),
      phone: this.contactForm.value.phone.trim()
    }
    this.contactService.addContact(newContact)
    console.log(newContact)
    }
    this.clearInputs();
      }
    else {
      console.log('invalid')
    }
  }

  clearInputs() {
    this.contactForm.reset();
    console.log('Inputs cleared')
  }

  deleteContact() {
    if(this.contactToEdit?.id) {
      this.contactService.deleteContact(this.contactToEdit?.id);
    }
    console.log('Deleted contact with', this.contactToEdit?.id)
    // this.contactService.deleteContact('kFUgrtMZHpap4hhb1SHn') //war zum Testen des Löschens
  }

  
}
