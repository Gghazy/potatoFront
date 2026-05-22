import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { SeasonsRoutingModule } from './seasons-routing-module';
import { SeasonsList } from './seasons-list/seasons-list';

@NgModule({
  declarations: [SeasonsList],
  imports: [SharedModule, SeasonsRoutingModule],
})
export class SeasonsModule {}
