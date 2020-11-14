import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-dynamic-three',
  templateUrl: './dynamic-three.component.html',
  changeDetection: ChangeDetectionStrategy.Reactivity,
})
export class DynamicThreeComponent implements OnInit {

  contentArray = [
    {title: 'Povzetek'},
    {title: 'Abstract' },
    {
      title: 'Uvod',
      children: ['Motivacija']
    },
    {
      title: 'Pregled področja',
      children: [
        'Spletni programski jeziki',
        'Komponentni razvoj programske opreme',
        'Komponentni razvoj spletnih aplikacij',
        'Popularna spletna ogrodja'
      ]
    },
    {
      title: 'Primerjava komunikacije med komponentami',
      children: ['Angular', 'React', 'Vue']
    },
    {title: 'Nadgradnja komunikacije' },
    {title: 'Rezultati in testiranje' },
    {title: 'Sklepne ugotovitve' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
