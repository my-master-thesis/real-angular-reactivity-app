import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicEightComponent } from './dynamic-eight.component';

describe('DynamicEightComponent', () => {
  let component: DynamicEightComponent;
  let fixture: ComponentFixture<DynamicEightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicEightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicEightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
