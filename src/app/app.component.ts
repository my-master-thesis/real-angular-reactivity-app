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
    { link: '', text: 'Naslovnica' },
    { link: 'contacts', text: 'Imenik' },
    { link: 'boundary', text: 'Test robnih primerov' },
    { link: 'html', text: 'Vsebina' },
    { link: 'components', text: 'Komponente' },
  ];

  toggleMenu() {
    this.showToolbar = !this.showToolbar;
  }
}
