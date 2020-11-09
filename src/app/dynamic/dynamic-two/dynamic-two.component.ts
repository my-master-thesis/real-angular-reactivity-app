import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dynamic-two',
  templateUrl: './dynamic-two.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DynamicTwoComponent implements OnInit {

  showThree = true;
  showFour = true;

  componentTitle = 'Komponenta 2';
  componentText = 'Vsebuje samo tole besedilo (ki je podano s pomočjo interpolacije) in 2 podkomponenti.';

  constructor() { }

  ngOnInit(): void {
  }

}
