import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { RefrigeratorsRoutingModule } from './refrigerators-routing-module';
import { RefrigeratorsList } from './refrigerators-list/refrigerators-list';
import { RefrigeratorForm } from './refrigerator-form/refrigerator-form';

@NgModule({
  declarations: [RefrigeratorsList, RefrigeratorForm],
  imports: [SharedModule, RefrigeratorsRoutingModule],
})
export class RefrigeratorsModule {}
