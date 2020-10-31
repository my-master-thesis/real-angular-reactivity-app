import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BoundaryCasesComponent } from './boundary-cases/boundary-cases.component';
import { ContactsComponent } from './contacts/contacts.component';
import { CardComponent } from './contacts/card/card.component';
import { GridComponent } from './contacts/grid/grid.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { FilterPipe } from './filter.pipe';
import { TestComponent } from './boundary-cases/test/test.component';
import { LevelOneComponent } from './boundary-cases/level-one/level-one.component';
import { LevelTwoComponent } from './boundary-cases/level-two/level-two.component';
import { LevelThreeComponent } from './boundary-cases/level-three/level-three.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { InputComponent } from './components/input/input.component';
import { SelectComponent } from './components/select/select.component';
import { TasksComponent } from './tasks/tasks.component';
import { DetailComponent } from './contacts/detail/detail.component';
import { TableComponent } from './tasks/table/table.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    BoundaryCasesComponent,
    ContactsComponent,
    CardComponent,
    GridComponent,
    FilterPipe,
    TestComponent,
    LevelOneComponent,
    LevelTwoComponent,
    LevelThreeComponent,
    PaginationComponent,
    InputComponent,
    SelectComponent,
    TasksComponent,
    DetailComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
