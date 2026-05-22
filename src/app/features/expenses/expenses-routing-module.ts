import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpensesList } from './expenses-list/expenses-list';

const routes: Routes = [{ path: '', component: ExpensesList }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpensesRoutingModule {}
