import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FarmerTransactionsList } from './farmer-transactions-list/farmer-transactions-list';
import { FarmerTransactionForm } from './farmer-transaction-form/farmer-transaction-form';

const routes: Routes = [
  { path: '', component: FarmerTransactionsList },
  { path: 'new', component: FarmerTransactionForm },
  { path: ':id', component: FarmerTransactionForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FarmerTransactionsRoutingModule {}
