import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSixComponent } from './dynamic-six.component';

describe('DynamicSixComponent', () => {
  let component: DynamicSixComponent;
  let fixture: ComponentFixture<DynamicSixComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicSixComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicSixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
