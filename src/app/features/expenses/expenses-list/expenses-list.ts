import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ExpensesService } from '../expenses.service';
import { CreateExpenseRequest, Expense } from '../../../shared/Models/expenses/expense.models';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../../../shared/Models/common/paged-result';

function emptyForm(): CreateExpenseRequest {
  return { date: new Date().toISOString().slice(0, 10), amount: 0, description: '' };
}

@Component({
  selector: 'app-expenses-list',
  standalone: false,
  templateUrl: './expenses-list.html',
  styleUrls: ['./expenses-list.css'],
})
export class ExpensesList implements OnInit {
  private service = inject(ExpensesService);
  private toastr = inject(ToastrService);

  // Data
  expenses = signal<Expense[]>([]);
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

  hasFilters = computed(() => !!(this.search() || this.from() || this.to()));

  // Form
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);
  showModal = signal<boolean>(false);
  form = signal<CreateExpenseRequest>(emptyForm());

  // Summary
  summary = signal<{ total: number; count: number }>({ total: 0, count: 0 });
  total = computed(() => this.summary().total);

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
        this.expenses.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadSummary(): void {
    this.service.summary().subscribe(s => this.summary.set(s));
  }

  onSearchInput(value: string): void { this.searchInput$.next(value); }
  onFromChange(value: string): void { this.from.set(value); this.page.set(1); this.load(); }
  onToChange(value: string): void { this.to.set(value); this.page.set(1); this.load(); }
  onPageSizeChange(value: number | string): void { this.pageSize.set(+value); this.page.set(1); this.load(); }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.page.set(p);
    this.load();
  }

  resetFilters(): void {
    this.search.set('');
    this.from.set('');
    this.to.set('');
    this.page.set(1);
    this.load();
  }

  updateForm<K extends keyof CreateExpenseRequest>(key: K, value: CreateExpenseRequest[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  openAdd(): void {
    this.form.set(emptyForm());
    this.editingId.set(null);
    this.showModal.set(true);
  }

  save(): void {
    const f = this.form();
    if (!f.description.trim()) {
      this.toastr.warning('من فضلك أدخل وصف للمصروف');
      return;
    }

    const id = this.editingId();
    const obs = id !== null
      ? this.service.update(id, { ...f, id })
      : this.service.create(f);

    obs.subscribe({
      next: () => {
        this.toastr.success(id !== null ? 'تم تحديث المصروف' : 'تم إضافة المصروف');
        this.cancel();
        this.load();
        this.loadSummary();
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل الحفظ'),
    });
  }

  edit(e: Expense): void {
    this.form.set({
      date: new Date(e.date).toISOString().slice(0, 10),
      amount: e.amount,
      description: e.description,
    });
    this.editingId.set(e.id);
    this.showModal.set(true);
  }

  cancel(): void {
    this.form.set(emptyForm());
    this.editingId.set(null);
    this.showModal.set(false);
  }

  askDelete(id: number): void { this.deleteId.set(id); }
  cancelDelete(): void { this.deleteId.set(null); }

  confirmDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.toastr.success('تم حذف المصروف');
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
