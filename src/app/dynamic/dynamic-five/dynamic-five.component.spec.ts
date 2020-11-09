import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFiveComponent } from './dynamic-five.component';

describe('DynamicFiveComponent', () => {
  let component: DynamicFiveComponent;
  let fixture: ComponentFixture<DynamicFiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicFiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicFiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
