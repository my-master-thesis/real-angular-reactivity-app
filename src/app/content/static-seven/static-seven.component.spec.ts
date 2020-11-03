import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticSevenComponent } from './static-seven.component';

describe('StaticSevenComponent', () => {
  let component: StaticSevenComponent;
  let fixture: ComponentFixture<StaticSevenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticSevenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticSevenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
