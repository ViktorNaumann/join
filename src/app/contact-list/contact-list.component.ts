import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService, Contact } from '../services/contact.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit, OnDestroy {
  groupedContacts: { [key: string]: Contact[] } = {};
  private contactsSubscription: Subscription = new Subscription();

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactsSubscription = this.contactService.getContacts().subscribe({
      next: (contacts) => {
        console.log('Realtime contacts update:', contacts);
        this.groupedContacts = this.groupByInitial(contacts);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.contactsSubscription.unsubscribe();
  }

  groupByInitial(contacts: Contact[]): { [key: string]: Contact[] } {
    const validContacts = contacts.filter(contact => contact && contact.name);
    
    return validContacts.reduce((groups, contact) => {
      const initial = contact.name.charAt(0).toUpperCase();
      groups[initial] = groups[initial] || [];
      groups[initial].push(contact);
      groups[initial].sort((a, b) => a.name.localeCompare(b.name));
      return groups;
    }, {} as { [key: string]: Contact[] });
  }

  keyAsc = (a: any, b: any) => a.key.localeCompare(b.key);

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }
}


