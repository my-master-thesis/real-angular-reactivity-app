import {Component, OnDestroy, OnInit} from '@angular/core';
import {Contact} from './contact';
import {ContactsStoreService} from './contacts-store.service';
import {Subscription} from 'rxjs';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('1s ease-out',
              style({ height: 300, opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ height: 300, opacity: 1 }),
            animate('1s ease-in',
              style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ],
})
export class ContactsComponent implements OnInit, OnDestroy {

  public contacts: Contact[];
  favorites: Contact[];
  private contactsSubscription: Subscription;

  constructor(private readonly contactsStoreService: ContactsStoreService) { }

  ngOnInit(): void {
    this.contactsSubscription = this.contactsStoreService.contactsSubject.subscribe(contacts => {
      this.contacts = contacts;
      this.getFavorites();
    });
  }

  ngOnDestroy() {
    if (this.contactsSubscription) {
      this.contactsSubscription.unsubscribe();
    }
  }

  remove(id: number) {
    this.contactsStoreService.contactsSubject.next(this.contacts.filter(contact => contact.id !== id));
  }

  addNew() {
    const maxId = this.contacts.reduce(
      (max, contact) => (contact.id > max ? contact.id : max),
      0
    );
    this.contacts.unshift({
      id: maxId + 1,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
  }

  getFavorites() {
    this.favorites = this.contacts.filter(contact => contact.isFavorite);
  }
}
