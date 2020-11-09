import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-static-five',
  templateUrl: './static-five.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StaticFiveComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
