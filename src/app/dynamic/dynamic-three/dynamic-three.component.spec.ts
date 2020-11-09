import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicThreeComponent } from './dynamic-three.component';

describe('DynamicThreeComponent', () => {
  let component: DynamicThreeComponent;
  let fixture: ComponentFixture<DynamicThreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicThreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
