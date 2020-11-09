import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dynamic-eight',
  templateUrl: './dynamic-eight.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DynamicEightComponent implements OnInit {

  inputField;
  selectField;
  textField;
  checkField;
  radioField;
  buttonClickedCounter = 0;

  constructor() { }

  ngOnInit(): void {
  }

}
