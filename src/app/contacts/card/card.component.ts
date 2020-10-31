import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-contacts-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input() contact;

  constructor() { }

  ngOnInit(): void {
  }

}
