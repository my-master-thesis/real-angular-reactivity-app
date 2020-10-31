import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contacts-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {

  contacts;

  constructor() { }

  ngOnInit(): void {
    this.contacts = [1,2,3,4,5,6];
  }

}
