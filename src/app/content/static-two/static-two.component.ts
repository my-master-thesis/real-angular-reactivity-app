import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-static-two',
  templateUrl: './static-two.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
})
export class StaticTwoComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
