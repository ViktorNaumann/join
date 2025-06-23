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
  // @Input() contactToEdit?: Contact;

  constructor(private form: FormBuilder, private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactForm = this.form.group({
      name: ['', [Validators.required, notOnlyWhitespace]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.min(10), Validators.pattern(/^\d+$/)]]
    });
    
    // if (this.contactToEdit) {
    //   this.contactForm.patchValue({
    //     name: this.contactToEdit.name,
    //     email: this.contactToEdit.email,
    //     phone: this.contactToEdit.phone
    //   });
    // }

    // NEU - Edit-Kontakt aus Service abrufen
    this.editContactSubscription = this.contactService.editContact$.subscribe(contact => {
      this.contactToEdit = contact || undefined;
      if (this.contactToEdit) {
        this.contactForm.patchValue({
          name: this.contactToEdit.name,
          email: this.contactToEdit.email,
          phone: this.contactToEdit.phone
        });
      }
    });
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
      //Wenn Kontaktdaten übergeben wurden soll editiert/geupdated werden
      if(this.contactToEdit?.id) {
        let editContact: Contact = {
          name: this.contactForm.value.name.trim(),
          email: this.contactForm.value.email.trim(),
          phone: this.contactForm.value.phone.trim()
        }
        this.contactService.updateContact(this.contactToEdit.id, editContact);
      } else {
      //andernfalls soll ein neuer Kontakt erstellt werden
      let newContact: Contact = {
      name: this.contactForm.value.name.trim(),
      email: this.contactForm.value.email.trim(),
      phone: this.contactForm.value.phone.trim()
    }
    this.contactService.addContact(newContact)
    console.log(newContact)
    }
    //Inputs danach immer leeren
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
