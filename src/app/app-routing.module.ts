import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {BoundaryCasesComponent} from './boundary-cases/boundary-cases.component';
import {ContactsComponent} from './contacts/contacts.component';
import {DetailComponent} from './contacts/detail/detail.component';
import {TasksComponent} from './tasks/tasks.component';
import {ContentComponent} from './content/content.component';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'boundary', component: BoundaryCasesComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'contacts/:id', component: DetailComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'content', component: ContentComponent },
  {path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
