import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantsList } from './tenants-list/tenants-list';
import { superAdminGuard } from '../../core/guards/super-admin.guard';

const routes: Routes = [
  { path: '', component: TenantsList, canActivate: [superAdminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TenantsRoutingModule {}
