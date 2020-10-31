import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Contact} from './contact';

@Injectable({
  providedIn: 'root'
})
export class ContactsStoreService {

  contactsSubject: BehaviorSubject<Contact[]> = new BehaviorSubject<Contact[]>([
    {
      id: 9,
      firstName: 'Miran',
      lastName: 'Novak',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 8,
      firstName: 'Osma',
      lastName: 'Oseba',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 7,
      firstName: 'Nekdo',
      lastName: 'Nekje',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 6,
      firstName: 'Marija',
      lastName: 'Novak',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 5,
      firstName: 'Štefka',
      lastName: 'Štefanc',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 3,
      firstName: 'Test',
      lastName: 'Test',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 2,
      firstName: 'Janez',
      lastName: 'Novak',
      email: 'test@test.si',
      phone: '123456789'
    },
    {
      id: 1,
      firstName: 'Prvi',
      lastName: 'Vnos',
      email: 'test@test.si',
      phone: '123456789'
    }
  ]);

  constructor() { }

  getContactById(id: number): Contact {
    return this.contactsSubject.value.find(contact => contact.id === id);
  }
}
