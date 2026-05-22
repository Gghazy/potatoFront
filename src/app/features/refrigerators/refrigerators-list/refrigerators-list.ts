import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RefrigeratorsService } from '../refrigerators.service';
import { Refrigerator, RefrigeratorsSummary } from '../../../shared/Models/refrigerators/refrigerator.models';

@Component({
  selector: 'app-refrigerators-list',
  standalone: false,
  templateUrl: './refrigerators-list.html',
  styleUrls: ['./refrigerators-list.css'],
})
export class RefrigeratorsList implements OnInit {
  private service = inject(RefrigeratorsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  refrigerators = signal<Refrigerator[]>([]);
  loading = signal<boolean>(false);
  search = signal<string>('');

  summary = signal<RefrigeratorsSummary>({ count: 0, totalSackCount: 0, totalWeight: 0, totalExpenses: 0 });

  deleteId = signal<number | null>(null);

  private searchInput$ = new Subject<string>();

  hasSearch = computed(() => !!this.search());

  ngOnInit(): void {
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(s => {
        this.search.set(s);
        this.load();
      });
    this.load();
    this.loadSummary();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.search()).subscribe({
      next: data => { this.refrigerators.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  loadSummary(): void { this.service.summary().subscribe(s => this.summary.set(s)); }

  onSearchInput(value: string): void { this.searchInput$.next(value); }
  resetSearch(): void { this.search.set(''); this.load(); }

  goToNew(): void { this.router.navigate(['/features/refrigerators/new']); }
  viewDetails(id: number): void { this.router.navigate(['/features/refrigerators', id]); }
  edit(id: number): void { this.router.navigate(['/features/refrigerators', id], { queryParams: { edit: 1 } }); }

  askDelete(id: number): void { this.deleteId.set(id); }
  cancelDelete(): void { this.deleteId.set(null); }
  confirmDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.toastr.success('تم حذف التلاجة');
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
