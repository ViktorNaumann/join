import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
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
}

