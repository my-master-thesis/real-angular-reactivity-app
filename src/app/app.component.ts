import {ChangeDetectionStrategy, Component, HostListener} from '@angular/core';
import {timer} from 'rxjs';
import {TasksStoreService} from './tasks/tasks-store.service';
import {ContactsStoreService} from './contacts/contacts-store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppComponent {

  public showToolbar = true;
  public sideMenuItems = [
    { link: 'home', text: 'Naslovnica' },
    { link: 'contacts', text: 'Kontakti' },
    { link: 'tasks', text: 'Naloge' },
    { link: 'boundary', text: 'Test nastavljanja vrednosti' },
    { link: 'content', text: 'Statična vsebina' },
    { link: 'dynamic', text: 'Dinamična vsebina' },
  ];

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    this.tasksStoreService.saveToStorage();
    this.contactsStoreService.saveToStorage();
  }

  constructor(private tasksStoreService: TasksStoreService, private contactsStoreService: ContactsStoreService) {
  }

  toggleMenu() {
    this.showToolbar = !this.showToolbar;
  }
}
