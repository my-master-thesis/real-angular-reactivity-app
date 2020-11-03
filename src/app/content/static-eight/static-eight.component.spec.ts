import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticEightComponent } from './static-eight.component';

describe('StaticEightComponent', () => {
  let component: StaticEightComponent;
  let fixture: ComponentFixture<StaticEightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticEightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticEightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
