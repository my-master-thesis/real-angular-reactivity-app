import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Task} from '../task';
import {Contact} from '../../contacts/contact';
import {Subscription} from 'rxjs';
import {ContactsStoreService} from '../../contacts/contacts-store.service';
import {TasksStoreService} from '../tasks-store.service';

@Component({
  selector: 'app-tasks-table',
  templateUrl: './table.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TableComponent implements OnInit, OnDestroy {

  @Input() defaultContact;
  @Input() tasks: Task[];

  public contacts: Contact[];
  public pageIndex = 0;
  public pageSize = 25;
  public showContacts;
  private contactsSubscription: Subscription;

  constructor(private readonly contactsStoreService: ContactsStoreService, private readonly tasksStoreService: TasksStoreService) { }

  ngOnInit(): void {
    this.showContacts = !this.defaultContact;
    if (this.showContacts) {
      this.contactsSubscription = this.contactsStoreService.contactsSubject.subscribe(contacts => {
        this.contacts = [...contacts].sort((a, b) => a.isFavorite === b.isFavorite ? 0 : (a.isFavorite ? -1 : 1));
      });
    }
  }

  ngOnDestroy() {
    if (this.contactsSubscription) {
      this.contactsSubscription.unsubscribe();
    }
  }

  pageChange(pageEvent: {pageIndex: number, pageSize: number}) {
    this.pageIndex = pageEvent.pageIndex;
    this.pageSize = pageEvent.pageSize;
  }

  addNew() {
    // const maxId = this.tasks.reduce(
    //   (max, task) => (task.id > max ? task.id : max),
    //   0
    // );
    const newId = ++this.tasksStoreService.lastId;
    this.tasksStoreService.tasksSubject.next([
      {
        id: newId,
        title: '',
        description: '',
        contactId: this.defaultContact,
      },
      ...this.tasksStoreService.tasksSubject.value
    ]);
  }

}
