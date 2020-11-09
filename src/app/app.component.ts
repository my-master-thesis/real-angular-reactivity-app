import {ChangeDetectionStrategy, Component} from '@angular/core';
import {timer} from 'rxjs';

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

  toggleMenu() {
    this.showToolbar = !this.showToolbar;
  }
}
