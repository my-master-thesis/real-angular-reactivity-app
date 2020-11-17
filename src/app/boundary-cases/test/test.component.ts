import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-boundary-test',
  templateUrl: './test.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
  reactiveProperties: [
    'counterA', 'counterB', 'counterC', 'initialObject', 'resultsClick', 'resultsClickVar', 'resultsClickHidden',
    'resultsClickTimeout', 'resultsClickRecursiveTimeout', 'resultsMultiple', 'resultsSetObject'
  ]
})
export class TestComponent implements OnInit {

  public counterA = 1;
  public counterB = 1;
  public counterC = 1;
  public initialObject = {title: 'Some random obj', value: 0, deeper: {title: 'Deeper object', someBool: true}, emptyOby: {}};

  public resultsClick;
  public resultsClickVar;
  public resultsClickHidden;
  public resultsClickTimeout;
  public resultsClickRecursiveTimeout;
  public resultsMultiple;
  public resultsSetObject;

  private hidden = 1;

  private recursiveTimer;

  constructor() {
  }

  ngOnInit(): void {
  }

  click() {
    console.time('Function this increase');
    const tmp = Date.now();
    for (let i = 0; i < 10000000; i++) {
      this.counterA++;
      // this.cdr.markForCheck();
    }
    this.resultsClick = Date.now() - tmp;
    console.timeEnd('Function this increase');
  }

  clickVar() {
    console.time('Function var increase');
    const tmp = Date.now();
    let counter = this.counterB;
    for (let i = 0; i < 10000000; i++) {
      counter++;
    }
    this.counterB = counter;
    this.resultsClickVar = Date.now() - tmp;
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
    console.time('Function timeout increase');
    const tmp = Date.now();
    for (let i = 0; i < 10000; i++) {
      setTimeout(() => {
        this.counterC++;
      }, 1);
    }
    this.resultsClickTimeout = Date.now() - tmp;
    console.timeEnd('Function timeout increase');
  }

  clickRecursiveTimeout(nr) {
    if (nr === 1000) {
      console.time('Function recursive timeout increase');
      this.recursiveTimer = Date.now();
    }
    if (nr > 0) {
      setTimeout(() => {
        this.counterC++;
        this.clickRecursiveTimeout(nr - 1);
      }, 1);
    } else {
      this.resultsClickRecursiveTimeout = Date.now() - this.recursiveTimer;
      console.timeEnd('Function recursive timeout increase');
    }
  }

  clickMultiple() {
    console.time('Function multiple increase');
    const tmp = Date.now();
    for (let i = 0; i < 10000000; i++) {
      this.counterA++;
      this.counterB++;
      this.counterC++;
      // this.cdr.markForCheck();
    }
    this.resultsMultiple = Date.now() - tmp;
    console.timeEnd('Function multiple increase');
  }

  clickSetObject() {
    console.time('Function set object');
    const tmp = Date.now();
    for (let i = 0; i < 10000000; i++) {
      this.initialObject = {title: 'Some changed obj', value: i, deeper: {title: 'Deeper object', someBool: true}, emptyOby: {}};
      // this.cdr.markForCheck();
    }
    this.resultsSetObject = Date.now() - tmp;
    console.timeEnd('Function set object');
  }

}
