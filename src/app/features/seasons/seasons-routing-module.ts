import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeasonsList } from './seasons-list/seasons-list';

const routes: Routes = [
  { path: '', component: SeasonsList },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeasonsRoutingModule {}
