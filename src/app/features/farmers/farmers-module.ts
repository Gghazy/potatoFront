import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { FarmersRoutingModule } from './farmers-routing-module';
import { FarmersList } from './farmers-list/farmers-list';

@NgModule({
  declarations: [FarmersList],
  imports: [SharedModule, FarmersRoutingModule],
})
export class FarmersModule {}
