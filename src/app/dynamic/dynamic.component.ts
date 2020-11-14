import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.css'],
  changeDetection: ChangeDetectionStrategy.Reactivity,
})
export class DynamicComponent implements OnInit {

  showTwo = true;
  showFive = true;

  constructor() { }

  ngOnInit(): void {
  }

}
