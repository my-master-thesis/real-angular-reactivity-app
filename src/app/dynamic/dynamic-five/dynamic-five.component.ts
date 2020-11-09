import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dynamic-five',
  templateUrl: './dynamic-five.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DynamicFiveComponent implements OnInit {

  showSix = true;
  showSeven = true;
  showEight = true;

  componentTitle = 'Komponenta 5';
  componentText = 'Vsebuje samo tole besedilo (ki je podano s pomočjo interpolacije) in 3 podkomponente.';

  constructor() { }

  ngOnInit(): void {
  }

}
