import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TraderTransactionsList } from './trader-transactions-list/trader-transactions-list';
import { TraderTransactionForm } from './trader-transaction-form/trader-transaction-form';

const routes: Routes = [
  { path: '', component: TraderTransactionsList },
  { path: 'new', component: TraderTransactionForm },
  { path: ':id', component: TraderTransactionForm },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TraderTransactionsRoutingModule {}
