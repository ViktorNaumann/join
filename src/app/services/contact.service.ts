import { Injectable } from '@angular/core';
import { Firestore, collection, onSnapshot } from '@angular/fire/firestore';
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
      const contactsRef = collection(this.firestore, 'contacts');
      
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
}

