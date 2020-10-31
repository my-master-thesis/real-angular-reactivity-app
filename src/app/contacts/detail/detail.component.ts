import {Component, OnDestroy, OnInit} from '@angular/core';
import {TasksStoreService} from '../../tasks/tasks-store.service';
import {ContactsStoreService} from '../contacts-store.service';
import {Task} from '../../tasks/task';
import {Contact} from '../contact';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit, OnDestroy {

  public tasks: Task[];
  public contact: Contact;
  public contactId: number;
  private subscription: Subscription;

  constructor(
    private readonly tasksStoreService: TasksStoreService,
    private readonly contactsStoreService: ContactsStoreService,
    private readonly activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.contactId = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.contact = this.contactsStoreService.getContactById(this.contactId);
    this.subscription = this.tasksStoreService.getContactTasksObservable(this.contactId).subscribe(tasks => this.tasks = tasks);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
