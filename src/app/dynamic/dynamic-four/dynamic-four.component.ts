import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dynamic-four',
  templateUrl: './dynamic-four.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DynamicFourComponent implements OnInit {

  listItems = [
    '#1A gre za 10.000.000x povečevanje prikazanega števca pri čemer v vsakem koraku kličemo funkcijo za zaznavanje sprememb',
    '#1B gre za 10.000.000x povečevanje treh prikazanih števcev pri čemer v vsakem koraku kličemo funkcijo za zaznavanje sprememb',
    '#1C gre za 10.000.000x nastavljanje novega objekta v prikazano spremenljivko',
    '#2 gre za 10.000.000x povečevanje prikazanega števca pri čemer se ta začasno prepiše in povečuje v lokalni spremenljivki; funkcijo' +
    ' za zaznavanje sprememb kličemo samo na koncu',
    '#3 gre za 10.000.000x povečevanje skritega števca (ki se ne prikazuje na uporabniškem vmesniku) pri čemer v vsakem koraku kličemo' +
    ' funkcijo za zaznavanje sprememb',
    '#4 gre za 1.000x povečevanje prikazanega števca znotraj asinhrone funkcije setTimeout pri čemer v vsakem koraku kličemo' +
    ' funkcijo za zaznavanje sprememb',
    '#5 gre za 1.000x rekurzivno povečevanje prikazanega števca znotraj asinhrone funkcije setTimeout pri čemer v vsakem' +
    ' koraku kličemo funkcijo za zaznavanje sprememb',

  ];

  constructor() { }

  ngOnInit(): void {
  }

}
