import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { TraderTransactionsRoutingModule } from './trader-transactions-routing-module';
import { TraderTransactionsList } from './trader-transactions-list/trader-transactions-list';
import { TraderTransactionForm } from './trader-transaction-form/trader-transaction-form';

@NgModule({
  declarations: [TraderTransactionsList, TraderTransactionForm],
  imports: [SharedModule, TraderTransactionsRoutingModule],
})
export class TraderTransactionsModule {}
