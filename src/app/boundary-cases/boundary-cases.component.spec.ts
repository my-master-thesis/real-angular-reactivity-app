import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoundaryCasesComponent } from './boundary-cases.component';

describe('BoundaryCasesComponent', () => {
  let component: BoundaryCasesComponent;
  let fixture: ComponentFixture<BoundaryCasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoundaryCasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoundaryCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
