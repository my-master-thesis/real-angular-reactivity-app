import {AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
  reactiveProperties: ['value']
})
export class SelectComponent implements OnInit, AfterViewInit, ControlValueAccessor {

  @Input() label: string;
  @Input() name: string;
  @Input() placeholder = '';
  @Input() control: FormControl;

  @Input() data$: any[];
  @Input() bindLabel: string;
  @Input() bindLabelSecond: string;
  @Input() bindValue: string;

  @Output() changeEvent = new EventEmitter();
  @Output() focusEvent = new EventEmitter();

  value: any = '';
  formControl = new FormControl('');
  subscription: Subscription;

  constructor(
    // Retrieve the dependency only from the local injector,
    // not from parent or ancestors.
    @Self()
    // We want to be able to use the component without a form,
    // so we mark the dependency as optional.
    @Optional()
    private ngControl: NgControl
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngAfterViewInit(): void {
    this.subscription = this.formControl.valueChanges.subscribe((v) => {
      this.onTouched();
      this.onChange(v);
    });
  }
  ngOnInit(): void {}

  /**
   * Write form value to the DOM element (model => view)
   */
  writeValue(value: any): void {
    this.value = value;
  }

  /**
   * Update form when DOM element value changes (view => model)
   */
  registerOnChange(fn: any): void {
    // Store the provided function as an internal method.
    this.onChange = fn;
  }

  /**
   * Update form when DOM element is blurred (view => model)
   */
  registerOnTouched(fn: any): void {
    // Store the provided function as an internal method.
    this.onTouched = fn;
  }

  onChange(e): void {}
  onTouched(): void {}

  changeValue(args) {
    this.onChange(Number(args));
  }
}
