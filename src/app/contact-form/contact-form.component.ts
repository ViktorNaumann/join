import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
  styleUrl: './contact-form.component.scss'
})
export class ContactFormComponent implements OnInit, OnDestroy {
  contactForm!: FormGroup;
  //NEU
  contactToEdit?: Contact;
  private editContactSubscription?: Subscription;

  constructor(private form: FormBuilder, private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactForm = this.form.group({
      name: ['', [Validators.required, notOnlyWhitespace]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.min(10), Validators.pattern(/^\d+$/)]]
    });
    // NEU - Edit-Kontakt aus Service abrufen
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
    //NEU
    if (this.editContactSubscription) {
      this.editContactSubscription.unsubscribe();
    }
  }

  onClose(): void {
    this.contactService.hideForm();
    this.contactForm.reset();
  }

  onSubmit(){
    //Das Formular muss valide sein
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
        this.contactService.addContact(contact);
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
    console.log('Deleted contact with', this.contactToEdit?.id)
    // this.contactService.deleteContact('kFUgrtMZHpap4hhb1SHn') //war zum Testen des Löschens
  }

  
}
