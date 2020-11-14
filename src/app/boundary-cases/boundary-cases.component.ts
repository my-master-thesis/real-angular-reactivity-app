import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-boundary-cases',
  templateUrl: './boundary-cases.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
})
export class BoundaryCasesComponent implements OnInit {

  constructor() {
  }


  ngOnInit() {
  }
}
