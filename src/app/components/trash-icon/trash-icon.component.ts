import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-trash-icon',
  templateUrl: './trash-icon.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
})
export class TrashIconComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
