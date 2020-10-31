import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Contact} from '../contact';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-contacts-grid',
  templateUrl: './grid.component.html',
})
export class GridComponent implements OnInit {

  @Input() contacts: Contact[];
  @Input() search: boolean;

  @Output() favoriteChange = new EventEmitter();
  @Output() delete = new EventEmitter();

  public pageIndex = 0;
  public pageSize = 6;

  constructor() { }

  ngOnInit(): void {
  }

  pageChange(pageEvent: PageEvent) {
    this.pageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
  }
}
