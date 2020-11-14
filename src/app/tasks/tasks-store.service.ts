import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Task} from './task';

@Injectable({
  providedIn: 'root'
})
export class TasksStoreService {
  public lastId = 12;

  public tasksSubject: BehaviorSubject<Task[]>;
  private initialData = [
    {
      id: 12,
      title: 'Oddaj izdelek',
      description: 'Oddaj izdelek v ocenjevanje',
      contactId: 8,
    },
    {
      id: 11,
      title: 'Preveri pravilnost rešitev',
      description: '',
      contactId: 19
    },
    {
      id: 10,
      title: 'Udeleži se dogodka',
      description: 'V petek ob 18 uri',
      contactId: 26
    },
    {
      id: 9,
      title: 'Preglej razpored',
      description: '',
    },
    {
      id: 8,
      title: 'Dodeli nedeodeljene naloge',
      description: 'Vse nedodeljene naloge razdeli med kontakte',
      contactId: 7
    },
    {
      id: 7,
      title: 'Opolni šefa o sestanku',
      description: 'Sestanek s podjetjem',
      contactId: 4
    },
    {
      id: 6,
      title: 'Realiziraj končni produkt',
      description: '',
    },
    {
      id: 5,
      title: 'Testiraj produkt',
      description: '',
    },
    {
      id: 4,
      title: 'Odpravi javljeno napako',
      description: 'Stranka je po elektonski pošti javila napako',
    },
    {
      id: 3,
      title: 'Dostavi produkt',
      description: 'Na naslov Celovša 987',
    },
    {
      id: 2,
      title: 'Pripravi zagovor',
      description: 'Pripravi zagovor opravljenega dela',
      contactId: 33
    },
    {
      id: 1,
      title: 'Naredi nalogo za matematiko',
      description: 'Integralni izračun',
      contactId: 18,
    },
  ];

  constructor() {
    try {
      let storageData = localStorage.getItem('tasks-store');
      if (storageData) {
        storageData = JSON.parse(storageData);
        if (Array.isArray(storageData)) {
          storageData.forEach((item: Task) => {
            if (item.startDate) {
              item.startDate = new Date(item.startDate);
            }
          });
          this.initialData = storageData;
          this.lastId = Math.max(...storageData.map(item => item.id));
        }
      }
    } catch (e) {
      console.error(e);
    }
    this.tasksSubject = new BehaviorSubject<Task[]>(this.initialData);
  }

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

  saveToStorage() {
    localStorage.setItem('tasks-store', JSON.stringify(this.tasksSubject.value));
  }
}
