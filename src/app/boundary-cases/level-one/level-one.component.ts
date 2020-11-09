import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-level-one',
  templateUrl: './level-one.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LevelOneComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
