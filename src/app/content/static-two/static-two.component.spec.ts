import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticTwoComponent } from './static-two.component';

describe('StaticTwoComponent', () => {
  let component: StaticTwoComponent;
  let fixture: ComponentFixture<StaticTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
