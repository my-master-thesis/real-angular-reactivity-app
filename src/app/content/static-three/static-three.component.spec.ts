import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticThreeComponent } from './static-three.component';

describe('StaticThreeComponent', () => {
  let component: StaticThreeComponent;
  let fixture: ComponentFixture<StaticThreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticThreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
