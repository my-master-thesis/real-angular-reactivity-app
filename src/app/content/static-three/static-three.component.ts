import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-static-three',
  templateUrl: './static-three.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StaticThreeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
