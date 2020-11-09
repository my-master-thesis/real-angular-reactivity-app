import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFourComponent } from './dynamic-four.component';

describe('DynamicFourComponent', () => {
  let component: DynamicFourComponent;
  let fixture: ComponentFixture<DynamicFourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicFourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicFourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
