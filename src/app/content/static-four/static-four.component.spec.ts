import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticFourComponent } from './static-four.component';

describe('StaticFourComponent', () => {
  let component: StaticFourComponent;
  let fixture: ComponentFixture<StaticFourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticFourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
