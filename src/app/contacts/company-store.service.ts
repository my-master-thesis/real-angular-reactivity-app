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
      companyName: 'First Company',
      email: 'first@company.com',
      phone: '123456789'
    },
    {
      id: 2,
      companyName: 'Second Company',
      email: 'second@company.com',
      phone: '123456789'
    },
    {
      id: 3,
      companyName: 'Third Company',
      email: 'third@company.com',
      phone: '123456789'
    },
    {
      id: 4,
      companyName: 'Fourth Company',
      email: 'fourth@company.com',
      phone: '123456789'
    },
    {
      id: 5,
      companyName: 'Fifth Company',
      email: 'fifth@company.com',
      phone: '123456789'
    },
    {
      id: 6,
      companyName: 'Sixth Company',
      email: 'sixth@company.com',
      phone: '123456789'
    },
    {
      id: 7,
      companyName: 'Seventh Company',
      email: 'seventh@company.com',
      phone: '123456789'
    },
    {
      id: 8,
      companyName: 'Eighth Company',
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
