import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FarmersList } from './farmers-list/farmers-list';

const routes: Routes = [
  { path: '', component: FarmersList },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FarmersRoutingModule {}
