import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTwoComponent } from './dynamic-two.component';

describe('DynamicTwoComponent', () => {
  let component: DynamicTwoComponent;
  let fixture: ComponentFixture<DynamicTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
