import { TestBed } from '@angular/core/testing';

import { ContactsStoreService } from './contacts-store.service';

describe('ContactsStoreService', () => {
  let service: ContactsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
