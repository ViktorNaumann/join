import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService, Contact } from '../services/contact.service';
import { notOnlyWhitespace } from '../services/contact.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})

export class ContactFormComponent implements OnInit, OnDestroy {
  @Output()addedContact = new EventEmitter<Contact>();
  contactForm!: FormGroup;
  contactToEdit?: Contact;
  private editContactSubscription?: Subscription;
  constructor(private form: FormBuilder, public contactService: ContactService) {}

  ngOnInit(): void {
    this.contactForm = this.form.group({
      name: ['', [Validators.required, notOnlyWhitespace]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.min(10), Validators.pattern(/^\d+$/)]]
    });
    this.editContactSubscription =  this.contactService.editContact$.subscribe(this.getDataToEdit);
  }

getDataToEdit = (contact: Contact | null) => {
  this.contactToEdit = contact || undefined;
  if (this.contactToEdit) {
    this.contactForm.patchValue({
      name: this.contactToEdit.name,
      email: this.contactToEdit.email,
      phone: this.contactToEdit.phone
    });
  }
}

  ngOnDestroy(): void {
    if (this.editContactSubscription) {
      this.editContactSubscription.unsubscribe();
    }
  }

  onClose(): void {
    this.contactService.hideForm();
    this.contactForm.reset();
  }

  async onSubmit(){
    if(this.contactForm.valid){
      const { name, email, phone } = this.contactForm.value;
      const contact: Contact = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      };
      //Wenn Kontaktdaten übergeben wurden soll editiert/geupdated werden
      if(this.contactToEdit?.id) {
        this.contactService.updateContact(this.contactToEdit.id, contact);
      } else {
        //andernfalls soll ein neuer Kontakt erstellt werden
        const newContact = await this.contactService.addContact(contact);
        if (newContact) {
          this.addedContact.emit(newContact); // <--- Neuer vollständiger Kontakt mit ID
        }
    }
      this.clearInputs();
      this.onClose();
    }
  }

  clearInputs() {
    this.contactForm.reset();
    console.log('Inputs cleared')
  }

  deleteContact() {
    if(this.contactToEdit?.id) {
      this.contactService.deleteContact(this.contactToEdit?.id);
      this.onClose();
    }
    console.log('Deleted contact with', this.contactToEdit?.id);
  }
}
