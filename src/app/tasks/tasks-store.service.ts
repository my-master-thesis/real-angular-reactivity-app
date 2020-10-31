import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Task} from './task';

@Injectable({
  providedIn: 'root'
})
export class TasksStoreService {

  public tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([
    {
      id: 1,
      title: 'TODO',
      description: 'Naredi to',
    }
  ]);

  constructor() { }

  getTaskById(id: number): Task {
    return this.tasksSubject.value.find(task => task.id === id);
  }

  getContactTasks(id: number): Task[] {
    return this.tasksSubject.value.filter(task => task.contactId === id);
  }

  getContactTasksObservable(id: number): Observable<Task[]> {
    return this.tasksSubject.pipe(
      map(tasks => tasks.filter(task => task.contactId === id))
    );
  }
}
