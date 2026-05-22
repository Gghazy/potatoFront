import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { UsersRoutingModule } from './users-routing-module';
import { UsersList } from './users-list/users-list';

@NgModule({
  declarations: [UsersList],
  imports: [SharedModule, UsersRoutingModule],
})
export class UsersModule {}
