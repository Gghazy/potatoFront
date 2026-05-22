import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { FeaturesRoutingModule } from './features-routing-module';
import { FeaturesComponent } from './features.component';
import { Home } from './home/home';

@NgModule({
  declarations: [FeaturesComponent, Home],
  imports: [SharedModule, FeaturesRoutingModule],
})
export class FeaturesModule {}
