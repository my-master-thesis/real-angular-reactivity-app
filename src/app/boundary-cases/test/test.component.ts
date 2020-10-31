import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-boundary-test',
  templateUrl: './test.component.html'
})
export class TestComponent implements OnInit {

  public counter = 1;
  public resultsClick;
  public resultsClickVar;
  public resultsClickHidden;
  public resultsClickTimeout;
  public resultsClickRecursiveTimeout;
  private hidden = 1;

  constructor() { }

  ngOnInit(): void {
  }

  click() {
    console.time('Function this increase');
    const tmp = Date.now();
    for (let i = 0; i < 10000000; i++) {
      this.counter++;
      // this.cdr.markForCheck();
    }
    this.resultsClick = Date.now() - tmp;
    console.timeEnd('Function this increase');
  }

  clickVar() {
    console.time('Function var increase');
    const tmp = Date.now();
    let counter = this.counter;
    for (let i = 0; i < 10000000; i++) {
      counter++;
    }
    this.resultsClickVar = Date.now() - tmp;
    this.counter = counter;
    console.timeEnd('Function var increase');
  }

  clickHidden() {
    console.time('Function hidden increase');
    const tmp = Date.now();
    for (let i = 0; i < 10000000; i++) {
      this.hidden++;
    }
    this.resultsClickHidden = Date.now() - tmp;
    console.timeEnd('Function hidden increase');
  }

  clickTimeout() {
    // eslint-disable-next-line no-console
    console.time('Function timeout increase');
    const tmp = Date.now();
    for (let i = 0; i < 1000; i++) {
      setTimeout(() => {
        this.counter++;
      }, 1);
    }
    this.resultsClickTimeout = Date.now() - tmp;
    // eslint-disable-next-line no-console
    console.timeEnd('Function timeout increase');
  }

  clickRecursiveTimeout(nr) {
    if (nr === 1000) {
      // eslint-disable-next-line no-console
      console.time('Function recursive timeout increase');
    }
    if (nr > 0) {
      setTimeout(() => {
        this.counter++;
        this.clickRecursiveTimeout(nr - 1);
      }, 1);
    } else {
      // eslint-disable-next-line no-console
      console.timeEnd('Function recursive timeout increase');
    }
  }

}
