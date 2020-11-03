import { Component } from '@angular/core';
import {timer} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public showToolbar = true;
  public sideMenuItems = [
    { link: 'home', text: 'Naslovnica' },
    { link: 'contacts', text: 'Kontakti' },
    { link: 'tasks', text: 'Naloge' },
    { link: 'boundary', text: 'Test robnih primerov' },
    { link: 'content', text: 'Statična vsebina' },
    { link: 'components', text: 'Dinamična vsebina' },
  ];

  toggleMenu() {
    this.showToolbar = !this.showToolbar;
  }
}
