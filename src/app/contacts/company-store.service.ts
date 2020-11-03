import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Company} from './company';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompanyStoreService {

  public companySubject: BehaviorSubject<Company[]> = new BehaviorSubject<Company[]>([
    {
      id: 1,
      companyName: 'Prvo Podjetje',
      email: 'first@company.com',
      phone: '123456789'
    },
    {
      id: 2,
      companyName: 'Drugo Podjetje',
      email: 'second@company.com',
      phone: '123456789'
    },
    {
      id: 3,
      companyName: 'Tretje Podjetje',
      email: 'third@company.com',
      phone: '123456789'
    },
    {
      id: 4,
      companyName: 'Četrto Podjetje',
      email: 'fourth@company.com',
      phone: '123456789'
    },
    {
      id: 5,
      companyName: 'Peto Podjetje',
      email: 'fifth@company.com',
      phone: '123456789'
    },
    {
      id: 6,
      companyName: 'Šesto Podjetje',
      email: 'sixth@company.com',
      phone: '123456789'
    },
    {
      id: 7,
      companyName: 'Sedmo Podjetje',
      email: 'seventh@company.com',
      phone: '123456789'
    },
    {
      id: 8,
      companyName: 'Osmo Podjetje',
      email: 'eighth@company.com',
      phone: '123456789'
    }
  ]);

  constructor() { }

  getCompanyObservableById(id: number): Observable<Company> {
    return this.companySubject.pipe(
      map(companies =>
        companies.find(company => company.id === id)
      )
    );
  }

  getCompanyById(id: number): Company {
    return this.companySubject.value.find(company => company.id === id);
  }
}
