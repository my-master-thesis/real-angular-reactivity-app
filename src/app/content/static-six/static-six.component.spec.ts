import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticSixComponent } from './static-six.component';

describe('StaticSixComponent', () => {
  let component: StaticSixComponent;
  let fixture: ComponentFixture<StaticSixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StaticSixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticSixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
