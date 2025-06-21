import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot, addDoc, doc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs'; //NEU BehaviorSubject
import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

export function notOnlyWhitespace(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
//NEU
private selectedContactSubject = new BehaviorSubject<Contact | null>(null);
  public selectedContact$ = this.selectedContactSubject.asObservable();

  constructor(private firestore: Firestore) {}

  getContacts(): Observable<Contact[]> {
    return new Observable(observer => {
      
      const contactsRef = this.getContactsRef();
      const unsubscribe = onSnapshot(contactsRef, 
        (snapshot) => {
          const contacts: Contact[] = [];
          snapshot.forEach((doc) => {
            contacts.push({ id: doc.id, ...doc.data() } as Contact);
          });
          observer.next(contacts);
        },
        (error) => {
          observer.error(error);
        }
      );

      // Cleanup-Funktion zurückgeben
      return () => unsubscribe();
    });
  }

  getContactsRef(){
    return collection(this.firestore, 'contacts');
  }

  async addContact(newContact: Contact) {
    let contactsRef = this.getContactsRef();
    await addDoc(contactsRef, newContact). catch(
      (err) => {console.log(err)}
    ).then( (newRef) => {console.log('New Contact list added with id', newRef?.id)})
  }

  async updateContact(id: string, updatedContact: Contact) {
    let docRef = doc(collection(this.firestore, 'contacts'), id);
    await updateDoc(docRef,this.getCleanJson(updatedContact)).catch(
      (err) => {console.error(err)}
    );
  }

  getCleanJson(updatedContact: Contact) {
      return {
      name: updatedContact.name,
      email: updatedContact.email,
      phone: updatedContact.phone
      }
    }

    //NEU
    selectContact(contact: Contact): void {
    this.selectedContactSubject.next(contact);
  }
    //NEU
  clearSelection(): void {
    this.selectedContactSubject.next(null);
  }
}

