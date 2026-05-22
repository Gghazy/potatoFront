import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersList } from './users-list/users-list';
import { adminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: '', component: UsersList, canActivate: [adminGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
