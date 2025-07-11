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
  '#9C27B0', // Purple
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#4CAF50', // Green
  '#F44336', // Red
  '#00BCD4', // Cyan
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#CDDC39', // Lime
  '#FF5722', // Deep Orange
  '#388E3C', // Dark Green
  '#1976D2', // Darker Blue
  '#7B1FA2', // Dark Purple
  '#D32F2F', // Dark Red
  '#5D4037', // Dark Brown
  '#303F9F', // Dark Indigo
  '#0288D1', // Light Blue (nicht zu hell)
  '#C2185B', // Deep Pink
  '#00796B', // Teal
  '#FFA000', // Amber (dunklerer Ton)
  '#455A64', // Dark Blue Grey
  '#AFB42B', // Olive/Lime Darker
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

  async addContact(newContact: Contact): Promise<Contact | null> {
    try {
      const contactsRef = this.getContactsRef();
      const docRef = await addDoc(contactsRef, newContact);
      const fullContact: Contact = { id: docRef.id, ...newContact };
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