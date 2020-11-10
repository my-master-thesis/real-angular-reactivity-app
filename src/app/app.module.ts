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
import { ContentComponent } from './content/content.component';
import { TrashIconComponent } from './components/trash-icon/trash-icon.component';
import { StarIconComponent } from './components/star-icon/star-icon.component';
import { StaticTwoComponent } from './content/static-two/static-two.component';
import { StaticThreeComponent } from './content/static-three/static-three.component';
import { StaticFourComponent } from './content/static-four/static-four.component';
import { StaticFiveComponent } from './content/static-five/static-five.component';
import { StaticSixComponent } from './content/static-six/static-six.component';
import { StaticEightComponent } from './content/static-eight/static-eight.component';
import { DynamicComponent } from './dynamic/dynamic.component';
import { DynamicTwoComponent } from './dynamic/dynamic-two/dynamic-two.component';
import { DynamicThreeComponent } from './dynamic/dynamic-three/dynamic-three.component';
import { DynamicFourComponent } from './dynamic/dynamic-four/dynamic-four.component';
import { DynamicFiveComponent } from './dynamic/dynamic-five/dynamic-five.component';
import { DynamicSixComponent } from './dynamic/dynamic-six/dynamic-six.component';
import { DynamicEightComponent } from './dynamic/dynamic-eight/dynamic-eight.component';
import { TableItemComponent } from './tasks/table-item/table-item.component';

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
    TableComponent,
    ContentComponent,
    TrashIconComponent,
    StarIconComponent,
    StaticTwoComponent,
    StaticThreeComponent,
    StaticFourComponent,
    StaticFiveComponent,
    StaticSixComponent,
    StaticEightComponent,
    DynamicComponent,
    DynamicTwoComponent,
    DynamicThreeComponent,
    DynamicFourComponent,
    DynamicFiveComponent,
    DynamicSixComponent,
    DynamicEightComponent,
    TableItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
