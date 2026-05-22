import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { ExpensesRoutingModule } from './expenses-routing-module';
import { ExpensesList } from './expenses-list/expenses-list';

@NgModule({
  declarations: [ExpensesList],
  imports: [SharedModule, ExpensesRoutingModule],
})
export class ExpensesModule {}
