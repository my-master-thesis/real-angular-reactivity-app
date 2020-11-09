import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-level-three',
  templateUrl: './level-three.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LevelThreeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
