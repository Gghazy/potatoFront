import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { AuthenticationRoutingModule } from './authentication-routing-module';
import { Login } from './login/login';

@NgModule({
  declarations: [Login],
  imports: [SharedModule, AuthenticationRoutingModule],
})
export class AuthenticationModule {}
