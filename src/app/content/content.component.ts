import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ContentComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
