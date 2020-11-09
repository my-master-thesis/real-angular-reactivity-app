import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-static-six',
  templateUrl: './static-six.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class StaticSixComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
