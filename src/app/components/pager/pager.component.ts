import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-pager',
  templateUrl: './pager.component.html'
})
export class PagerComponent implements OnInit {

  @Input() set length(length: number) {
    this.allRecords = length;
    this.calculateMaxPages();
  }
  @Input() set pageSize(pageSize: number) {
    this.pageSizeValue = pageSize;
    this.calculateMaxPages(true);
  }
  @Input() pageSizeOptions: number[];

  @Output() page = new EventEmitter();

  public allRecords;
  public pageSizeValue = 6;
  public selectedPage = 0;
  public maxPages = 0;

  constructor() { }

  ngOnInit(): void {
  }

  changePage(nr: number) {
    this.selectedPage += nr;
    this.emitChange();
  }

  calculateMaxPages(forceChange = false) {
    const max = this.allRecords / this.pageSizeValue;
    this.maxPages = Math.floor(max);
    if (max === this.maxPages) {
      this.maxPages--;
    }
    if (typeof this.selectedPage !== 'number' || this.selectedPage > this.maxPages) {
      this.selectedPage = this.maxPages;
      this.emitChange();
    } else if (this.selectedPage < 0 && this.allRecords > 0) {
      this.setPage(0);
    } else if (forceChange) {
      this.emitChange();
    }
  }

  private emitChange() {
    this.page.emit({
      pageIndex: this.selectedPage,
      pageSize: Number(this.pageSizeValue),
    });
  }

  setPage(page: number) {
    this.selectedPage = page;
    this.emitChange();
  }
}
