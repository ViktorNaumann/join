import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
}

export function notOnlyWhitespace(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (typeof value === 'string' && value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private selectedContactSubject = new BehaviorSubject<Contact | null>(null);
  public selectedContact$ = this.selectedContactSubject.asObservable();

  private showFormSubject = new BehaviorSubject<boolean>(false);
  public showForm$ = this.showFormSubject.asObservable();

  private editContactSubject = new BehaviorSubject<Contact | null>(null);
  public editContact$ = this.editContactSubject.asObservable();

  // NEU - Avatar-Farben
  private avatarColors = [
    '#9C27B0',
    '#2196F3',
    '#FF9800',
    '#4CAF50',
    '#F44336',
    '#00BCD4',
    '#795548',
    '#607D8B',
    '#E91E63',
    '#3F51B5',
    '#CDDC39',
    '#FF5722',
  ];

  constructor(private firestore: Firestore) {}

  getContacts(): Observable<Contact[]> {
    return new Observable((observer) => {
      const contactsRef = this.getContactsRef();
      const unsubscribe = onSnapshot(
        contactsRef,
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

  getContactsRef() {
    return collection(this.firestore, 'contacts');
  }

  getSingleContactsRef(docId: string) {
    return doc(collection(this.firestore, 'contacts'), docId);
  }

  // async addContact(newContact: Contact) {
  //   let contactsRef = this.getContactsRef();
  //   await addDoc(contactsRef, newContact). catch(
  //     (err) => {console.log(err)}
  //   ).then( (newRef) => {console.log('New Contact list added with id', newRef?.id)})
  // }

  async addContact(newContact: Contact): Promise<Contact | null> {
    try {
      const contactsRef = this.getContactsRef();
      const docRef = await addDoc(contactsRef, newContact);
      const fullContact: Contact = { id: docRef.id, ...newContact };
      console.log('New contact added with id:', docRef.id);
      return fullContact;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async updateContact(docId: string, updatedContact: Contact) {
    let docRef = this.getSingleContactsRef(docId);
    await updateDoc(docRef, this.getCleanJson(updatedContact)).catch((err) => {
      console.error(err);
    });
  }

  getCleanJson(updatedContact: Contact) {
    return {
      name: updatedContact.name,
      email: updatedContact.email,
      phone: updatedContact.phone,
    };
  }

  //NEU
  selectContact(contact: Contact): void {
    this.selectedContactSubject.next(contact);
  }
  //NEU
  clearSelection(): void {
    this.selectedContactSubject.next(null);
  }

  // NEU - Methoden für Formular-Anzeige
  showAddForm(): void {
    this.showFormSubject.next(true);
  }

  // NEU - Methode für Edit-Modus
  showEditForm(contact: Contact): void {
    this.editContactSubject.next(contact);
    this.showFormSubject.next(true);
  }

  hideForm(): void {
    this.showFormSubject.next(false);
    this.editContactSubject.next(null); //NEU
  }
  async deleteContact(docId: string) {
    await deleteDoc(this.getSingleContactsRef(docId)).catch((err) => {
      console.log(err);
    });
  }

  // NEU - Avatar-Funktionen
  getContactColor(contactName: string): string {
    let hash = 0;
    for (let i = 0; i < contactName.length; i++) {
      hash += contactName.charCodeAt(i);
    }
    return this.avatarColors[hash % this.avatarColors.length];
  }

  getInitials(name?: string): string {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  //NEU - Kontakte per ID abrufen z.B. für Tasks
  async getContactById(contactId: string): Promise<Contact | null> {
    const contactRef = this.getSingleContactsRef(contactId);
    return getDoc(contactRef).then(snapshot => {
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Contact;
      }
      return null;
    });
  }
}