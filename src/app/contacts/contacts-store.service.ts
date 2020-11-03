import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Contact} from './contact';

@Injectable({
  providedIn: 'root'
})
export class ContactsStoreService {

  contactsSubject: BehaviorSubject<Contact[]> = new BehaviorSubject<Contact[]>([
    {
      id: 33,
      firstName: 'Anja',
      lastName: 'Rupnik',
      email: 'anja@test.si',
      phone: '123456789',
      companyId: 5,
      isFavorite: true,
    },
    {
      id: 32,
      firstName: 'Suzaana',
      lastName: 'Suznik',
      email: 'anja@test.si',
      phone: '123456789',
      companyId: 1,
    },
    {
      id: 31,
      firstName: 'Nik',
      lastName: 'Hleb',
      email: 'nik@test.si',
      phone: '123456789',
      companyId: 1,
    },
    {
      id: 30,
      firstName: 'Jernej',
      lastName: 'Jakupinc',
      email: 'jernej@test.si',
      phone: '123456789',
      companyId: 6,
    },
    {
      id: 28,
      firstName: 'Drago',
      lastName: 'Novak',
      email: 'drago@test.si',
      phone: '123456789',
      companyId: 2,
    },
    {
      id: 28,
      firstName: 'Darja',
      lastName: 'Terenc',
      email: 'darja@test.si',
      phone: '123456789',
      companyId: 2,
    },
    {
      id: 27,
      firstName: 'Ivana',
      lastName: 'Dimnik',
      email: 'ivana@test.si',
      phone: '123456789'
    },
    {
      id: 26,
      firstName: 'Tanja',
      lastName: 'Rupnik',
      email: 'tanja@test.si',
      phone: '123456789'
    },
    {
      id: 25,
      firstName: 'Darko',
      lastName: 'Peterle',
      email: 'darko@test.si',
      phone: '123456789'
    },
    {
      id: 24,
      firstName: 'Matic',
      lastName: 'Horvat',
      email: 'matic@test.si',
      phone: '123456789',
      companyId: 4,
    },
    {
      id: 23,
      firstName: 'Mitja',
      lastName: 'Hribar',
      email: 'mitja@test.si',
      phone: '123456789',
      companyId: 3,
    },
    {
      id: 22,
      firstName: 'Milan',
      lastName: 'Jereb',
      email: 'milan@test.si',
      phone: '123456789',
      companyId: 1,
    },
    {
      id: 21,
      firstName: 'Nina',
      lastName: 'Jerman',
      email: 'nina@test.si',
      phone: '123456789',
      companyId: 1,
      isFavorite: true,
    },
    {
      id: 20,
      firstName: 'Miha',
      lastName: 'Sever',
      email: 'miha@test.si',
      phone: '123456789'
    },
    {
      id: 19,
      firstName: 'Irena',
      lastName: 'Kuhar',
      email: 'irena@test.si',
      phone: '123456789'
    },
    {
      id: 18,
      firstName: 'Matej',
      lastName: 'Lah',
      email: 'matej@test.si',
      phone: '123456789'
    },
    {
      id: 17,
      firstName: 'Eva',
      lastName: 'Zorko',
      email: 'eva@test.si',
      phone: '123456789'
    },
    {
      id: 16,
      firstName: 'Petra',
      lastName: 'Zajc',
      email: 'petra@test.si',
      phone: '123456789'
    },
    {
      id: 15,
      firstName: 'Bojan',
      lastName: 'Koren',
      email: 'bojan@test.si',
      phone: '123456789',
      isFavorite: true,
    },
    {
      id: 14,
      firstName: 'Peter',
      lastName: 'Oblak',
      email: 'peter@test.si',
      phone: '123456789'
    },
    {
      id: 13,
      firstName: 'Luka',
      lastName: 'Hribar',
      email: 'luka@test.si',
      phone: '123456789'
    },
    {
      id: 12,
      firstName: 'Barbara',
      lastName: 'Zupan',
      email: 'barbara@test.si',
      phone: '123456789'
    },
    {
      id: 11,
      firstName: 'Andreja',
      lastName: 'Bizjak',
      email: 'andreja@test.si',
      phone: '123456789'
    },
    {
      id: 10,
      firstName: 'Marjeta',
      lastName: 'Kralj',
      email: 'marjeta@test.si',
      phone: '123456789'
    },
    {
      id: 9,
      firstName: 'Miran',
      lastName: 'Turk',
      email: 'miran@test.si',
      phone: '123456789'
    },
    {
      id: 8,
      firstName: 'Anton',
      lastName: 'Golob',
      email: 'anton@test.si',
      phone: '123456789'
    },
    {
      id: 7,
      firstName: 'Mojca',
      lastName: 'Kos',
      email: 'mojca@test.si',
      phone: '123456789'
    },
    {
      id: 6,
      firstName: 'Ivan',
      lastName: 'Vidmar',
      email: 'ivan@test.si',
      phone: '123456789'
    },
    {
      id: 5,
      firstName: 'Maja',
      lastName: 'Mlakar',
      email: 'maja@test.si',
      phone: '123456789'
    },
    {
      id: 4,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@test.si',
      phone: '123456789',
      companyId: 3
    },
    {
      id: 3,
      firstName: 'Ana',
      lastName: 'Kranjc',
      email: 'ana@test.si',
      phone: '123456789'
    },
    {
      id: 2,
      firstName: 'Janez',
      lastName: 'Novak',
      email: 'janez@test.si',
      phone: '123456789'
    },
    {
      id: 1,
      firstName: 'Marija',
      lastName: 'Horvat',
      email: 'marija@test.si',
      phone: '123456789'
    }
  ]);

  constructor() { }

  getContactById(id: number): Contact {
    return this.contactsSubject.value.find(contact => contact.id === id);
  }
}
