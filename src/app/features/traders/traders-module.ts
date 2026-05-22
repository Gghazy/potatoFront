import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { TradersRoutingModule } from './traders-routing-module';
import { TradersList } from './traders-list/traders-list';

@NgModule({
  declarations: [TradersList],
  imports: [SharedModule, TradersRoutingModule],
})
export class TradersModule {}
