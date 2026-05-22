import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefrigeratorsList } from './refrigerators-list/refrigerators-list';
import { RefrigeratorForm } from './refrigerator-form/refrigerator-form';

const routes: Routes = [
  { path: '', component: RefrigeratorsList },
  { path: 'new', component: RefrigeratorForm },
  { path: ':id', component: RefrigeratorForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefrigeratorsRoutingModule {}
