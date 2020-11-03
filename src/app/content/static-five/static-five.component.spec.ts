import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticFiveComponent } from './static-five.component';

describe('StaticFiveComponent', () => {
  let component: StaticFiveComponent;
  let fixture: ComponentFixture<StaticFiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticFiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticFiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
