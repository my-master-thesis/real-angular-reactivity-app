import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
})
export class ContentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
