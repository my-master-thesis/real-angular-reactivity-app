import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BoundaryCasesComponent } from './boundary-cases/boundary-cases.component';
import { ContactsComponent } from './contacts/contacts.component';
import { CardComponent } from './contacts/card/card.component';
import { GridComponent } from './contacts/grid/grid.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BoundaryCasesComponent,
    ContactsComponent,
    CardComponent,
    GridComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
