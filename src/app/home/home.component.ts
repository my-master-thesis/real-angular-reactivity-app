import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
