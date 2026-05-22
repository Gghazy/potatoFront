import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { TenantsRoutingModule } from './tenants-routing-module';
import { TenantsList } from './tenants-list/tenants-list';

@NgModule({
  declarations: [TenantsList],
  imports: [SharedModule, TenantsRoutingModule],
})
export class TenantsModule {}
