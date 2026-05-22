import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesComponent } from './features.component';
import { Home } from './home/home';
import { adminGuard } from '../core/guards/admin.guard';
import { superAdminGuard } from '../core/guards/super-admin.guard';

const routes: Routes = [
  {
    path: '',
    component: FeaturesComponent,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      {
        path: 'farmers',
        loadChildren: () => import('./farmers/farmers-module').then(m => m.FarmersModule),
      },
      {
        path: 'farmer-transactions',
        loadChildren: () => import('./farmer-transactions/farmer-transactions-module').then(m => m.FarmerTransactionsModule),
      },
      {
        path: 'traders',
        loadChildren: () => import('./traders/traders-module').then(m => m.TradersModule),
      },
      {
        path: 'trader-transactions',
        loadChildren: () => import('./trader-transactions/trader-transactions-module').then(m => m.TraderTransactionsModule),
      },
      {
        path: 'refrigerators',
        loadChildren: () => import('./refrigerators/refrigerators-module').then(m => m.RefrigeratorsModule),
      },
      {
        path: 'expenses',
        loadChildren: () => import('./expenses/expenses-module').then(m => m.ExpensesModule),
      },
      {
        path: 'seasons',
        loadChildren: () => import('./seasons/seasons-module').then(m => m.SeasonsModule),
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile-module').then(m => m.ProfileModule),
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadChildren: () => import('./users/users-module').then(m => m.UsersModule),
      },
      {
        path: 'tenants',
        canActivate: [superAdminGuard],
        loadChildren: () => import('./tenants/tenants-module').then(m => m.TenantsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule {}
