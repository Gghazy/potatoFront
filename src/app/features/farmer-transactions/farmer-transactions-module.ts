import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { FarmerTransactionsRoutingModule } from './farmer-transactions-routing-module';
import { FarmerTransactionsList } from './farmer-transactions-list/farmer-transactions-list';
import { FarmerTransactionForm } from './farmer-transaction-form/farmer-transaction-form';

@NgModule({
  declarations: [FarmerTransactionsList, FarmerTransactionForm],
  imports: [SharedModule, FarmerTransactionsRoutingModule],
})
export class FarmerTransactionsModule {}
