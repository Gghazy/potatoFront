import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { FarmerTransactionsService } from '../farmer-transactions/farmer-transactions.service';
import { TraderTransactionsService } from '../trader-transactions/trader-transactions.service';
import { ExpensesService } from '../expenses/expenses.service';
import { RefrigeratorsService } from '../refrigerators/refrigerators.service';
import { FarmerTransactionsSummary } from '../../shared/Models/farmer-transactions/farmer-transaction.models';
import { TraderTransactionsSummary } from '../../shared/Models/trader-transactions/trader-transaction.models';
import { ExpensesSummary } from '../../shared/Models/expenses/expense.models';
import { RefrigeratorsSummary } from '../../shared/Models/refrigerators/refrigerator.models';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  private auth = inject(AuthService);
  private farmers = inject(FarmerTransactionsService);
  private traders = inject(TraderTransactionsService);
  private expenses = inject(ExpensesService);
  private refrigerators = inject(RefrigeratorsService);

  readonly fullName = this.auth.fullName;

  farmersSummary = signal<FarmerTransactionsSummary>({ total: 0, paid: 0, remaining: 0, count: 0, totalWeight: 0, totalNetWeight: 0 });
  tradersSummary = signal<TraderTransactionsSummary>({ total: 0, paid: 0, remaining: 0, totalCommission: 0, count: 0, totalWeight: 0, totalNetWeight: 0 });
  expensesSummary = signal<ExpensesSummary>({ total: 0, count: 0 });
  refrigeratorsSummary = signal<RefrigeratorsSummary>({ count: 0, totalSackCount: 0, totalWeight: 0, totalExpenses: 0 });

  // Net profit = trader sales + commission - farmer purchases - general expenses - refrigerator expenses
  netProfit = computed(() =>
    this.tradersSummary().total + this.tradersSummary().totalCommission
    - this.farmersSummary().total
    - this.expensesSummary().total
    - this.refrigeratorsSummary().totalExpenses);

  ngOnInit(): void {
    this.farmers.summary().subscribe(s => this.farmersSummary.set(s));
    this.traders.summary().subscribe(s => this.tradersSummary.set(s));
    this.expenses.summary().subscribe(s => this.expensesSummary.set(s));
    this.refrigerators.summary().subscribe(s => this.refrigeratorsSummary.set(s));
  }
}
