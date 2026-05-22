import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradersList } from './traders-list/traders-list';

const routes: Routes = [
  { path: '', component: TradersList },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TradersRoutingModule {}
