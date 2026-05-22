import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FarmerTransactionsService } from '../farmer-transactions.service';
import { FarmerTransaction } from '../../../shared/Models/farmer-transactions/farmer-transaction.models';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../../shared/Models/common/paged-result';

@Component({
  selector: 'app-farmer-transactions-list',
  standalone: false,
  templateUrl: './farmer-transactions-list.html',
  styleUrls: ['./farmer-transactions-list.css'],
})
export class FarmerTransactionsList implements OnInit {
  private service = inject(FarmerTransactionsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // Data
  transactions = signal<FarmerTransaction[]>([]);
  totalCount = signal<number>(0);

  // List query state
  search = signal<string>('');
  from = signal<string>('');
  to = signal<string>('');
  page = signal<number>(1);
  pageSize = signal<number>(DEFAULT_PAGE_SIZE);
  loading = signal<boolean>(false);

  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));
  readonly pageStart = computed(() => this.totalCount() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1);
  readonly pageEnd = computed(() => Math.min(this.page() * this.pageSize(), this.totalCount()));

  // Confirm-delete state
  deleteId = signal<number | null>(null);

  // Summary
  summary = signal<{ total: number; paid: number; remaining: number; count: number; totalWeight: number; totalNetWeight: number }>(
    { total: 0, paid: 0, remaining: 0, count: 0, totalWeight: 0, totalNetWeight: 0 });

  private searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(s => {
        this.search.set(s);
        this.page.set(1);
        this.load();
      });

    this.load();
    this.loadSummary();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll({
      search: this.search(),
      from: this.from() || undefined,
      to: this.to() || undefined,
      page: this.page(),
      pageSize: this.pageSize(),
    }).subscribe({
      next: result => {
        this.transactions.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadSummary(): void { this.service.summary().subscribe(s => this.summary.set(s)); }

  // Filter changes
  onSearchInput(value: string): void { this.searchInput$.next(value); }
  onFromChange(value: string): void { this.from.set(value); this.page.set(1); this.load(); }
  onToChange(value: string): void { this.to.set(value); this.page.set(1); this.load(); }
  onPageSizeChange(value: number | string): void { this.pageSize.set(+value); this.page.set(1); this.load(); }
  goToPage(p: number): void { if (p < 1 || p > this.totalPages() || p === this.page()) return; this.page.set(p); this.load(); }
  resetFilters(): void { this.search.set(''); this.from.set(''); this.to.set(''); this.page.set(1); this.load(); }
  hasFilters = computed(() => !!(this.search() || this.from() || this.to()));

  // Navigation
  goToNew(): void { this.router.navigate(['/features/farmer-transactions/new']); }
  viewDetails(id: number): void { this.router.navigate(['/features/farmer-transactions', id]); }
  edit(t: FarmerTransaction): void {
    if (t.isClosed) {
      this.toastr.warning('الفاتورة مغلقة — اضغط "فتح" أولاً عشان تعدلها');
      return;
    }
    this.router.navigate(['/features/farmer-transactions', t.id], { queryParams: { edit: 1 } });
  }

  // Close / Reopen
  closeInvoice(t: FarmerTransaction): void {
    this.service.close(t.id).subscribe({
      next: () => { this.toastr.success('تم إغلاق الفاتورة'); this.load(); },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل الإغلاق'),
    });
  }

  reopenInvoice(t: FarmerTransaction): void {
    this.service.reopen(t.id).subscribe({
      next: () => { this.toastr.success('تم إعادة فتح الفاتورة'); this.load(); },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل إعادة الفتح'),
    });
  }

  // Delete
  askDelete(id: number): void { this.deleteId.set(id); }
  cancelDelete(): void { this.deleteId.set(null); }
  confirmDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.toastr.success('تم حذف الفاتورة');
        this.deleteId.set(null);
        this.load();
        this.loadSummary();
      },
      error: err => {
        this.deleteId.set(null);
        this.toastr.error(err?.error?.message ?? 'فشل الحذف');
      },
    });
  }
}
