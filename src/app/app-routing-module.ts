import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { unauthGuard } from './core/guards/unauth.guard';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  {
    path: 'auth',
    canActivate: [unauthGuard],
    loadChildren: () => import('./authentication/authentication-module').then(m => m.AuthenticationModule),
  },
  {
    path: 'features',
    canActivate: [authGuard],
    loadChildren: () => import('./features/features-module').then(m => m.FeaturesModule),
  },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
