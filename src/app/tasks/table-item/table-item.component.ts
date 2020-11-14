import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Task} from '../task';
import {Contact} from '../../contacts/contact';
import {interval, Subscription} from 'rxjs';

@Component({
  selector: '[app-table-item]',
  templateUrl: './table-item.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class TableItemComponent implements OnInit, OnDestroy {

  @Input() set task(task: Task) {
    this.inputTask = task;
    if (task.startDate) {
      this.startInterval();
    }
  }

  get task(): Task {
    return this.inputTask;
  }

  @Input() showContacts: boolean;
  @Input() contacts: Contact[];

  private inputTask: Task;
  private timerSubscription: Subscription;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.stopTimer(true);
  }

  startTimer() {
    this.task.startDate = new Date(Date.now() - (this.task.duration ? this.task.duration : 0));
    this.startInterval();
  }

  stopTimer(skipStop = false) {
    if (this.timerSubscription && !this.timerSubscription.closed) {
      this.timerSubscription.unsubscribe();
      if (!skipStop) {
        this.task.startDate = null;
      }
    }
  }

  private startInterval() {
    this.stopTimer();
    this.timerSubscription = interval(1000).subscribe(() => this.task.duration = Date.now() - this.task.startDate.getTime());
  }
}
