import { TestBed } from '@angular/core/testing';

import { CompanyStoreService } from './company-store.service';

describe('CompanyStoreService', () => {
  let service: CompanyStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
