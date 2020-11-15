import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Contact} from '../contact';
import {Company} from '../company';
import {CompanyStoreService} from '../company-store.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-contacts-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  changeDetection: ChangeDetectionStrategy.Reactivity,
  reactiveProperties: ['contact']
})
export class CardComponent implements OnInit, OnDestroy {

  @Input() contact: Contact;
  @Input() full: boolean;
  @Output() favoriteChange = new EventEmitter();
  @Output() delete = new EventEmitter();

  public companies: Company[];
  private companySubscription: Subscription;

  constructor(private readonly companyStoreService: CompanyStoreService) { }

  ngOnInit(): void {
    this.companySubscription = this.companyStoreService.companySubject.subscribe(companies => this.companies = companies);
  }

  ngOnDestroy() {
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
    }
  }

  toggleFavorite() {
    this.contact.isFavorite = !this.contact.isFavorite;
    this.favoriteChange.emit(this.contact.isFavorite);
  }

  deleteContact() {
    this.delete.emit(this.contact.id);
  }
}
