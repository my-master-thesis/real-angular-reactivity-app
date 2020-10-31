import {Component, OnDestroy, OnInit} from '@angular/core';
import {TasksStoreService} from './tasks-store.service';
import {Subscription} from 'rxjs';
import {Task} from './task';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit, OnDestroy {

  public tasks: Task[];
  private tasksSubscription: Subscription;

  constructor(private readonly tasksStoreService: TasksStoreService) { }

  ngOnInit(): void {
    this.tasksSubscription = this.tasksStoreService.tasksSubject.subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  ngOnDestroy() {
    if (this.tasksSubscription) {
      this.tasksSubscription.unsubscribe();
    }
  }


}
