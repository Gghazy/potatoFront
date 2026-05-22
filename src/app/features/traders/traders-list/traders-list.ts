import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TradersService } from '../traders.service';
import {
  CreateTraderRequest,
  EGYPT_PHONE_REGEX,
  Trader,
} from '../../../shared/Models/traders/trader.models';

function emptyForm(): CreateTraderRequest {
  return { name: '', phoneNumber: '' };
}

@Component({
  selector: 'app-traders-list',
  standalone: false,
  templateUrl: './traders-list.html',
  styleUrls: ['./traders-list.css'],
})
export class TradersList implements OnInit {
  private service = inject(TradersService);
  private toastr = inject(ToastrService);

  traders = signal<Trader[]>([]);
  loading = signal<boolean>(false);
  search = signal<string>('');

  showModal = signal<boolean>(false);
  saving = signal<boolean>(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  form = signal<CreateTraderRequest>(emptyForm());

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
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.search()).subscribe({
      next: data => {
        this.traders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearchInput(value: string): void { this.searchInput$.next(value); }

  resetSearch(): void {
    this.search.set('');
    this.load();
  }

  updateForm<K extends keyof CreateTraderRequest>(key: K, value: CreateTraderRequest[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  openAdd(): void {
    this.form.set(emptyForm());
    this.editingId.set(null);
    this.showModal.set(true);
  }

  edit(t: Trader): void {
    this.form.set({ name: t.name, phoneNumber: t.phoneNumber ?? '' });
    this.editingId.set(t.id);
    this.showModal.set(true);
  }

  cancel(): void {
    this.form.set(emptyForm());
    this.editingId.set(null);
    this.showModal.set(false);
    this.saving.set(false);
  }

  save(): void {
    const f = this.form();
    if (!f.name.trim()) {
      this.toastr.warning('من فضلك أدخل اسم التاجر');
      return;
    }
    const phone = (f.phoneNumber ?? '').trim();
    if (phone && !EGYPT_PHONE_REGEX.test(phone)) {
      this.toastr.warning('رقم التليفون يجب أن يكون رقم مصرى صحيح (مثال: 01012345678)');
      return;
    }

    this.saving.set(true);
    const payload: CreateTraderRequest = {
      name: f.name.trim(),
      phoneNumber: phone || null,
    };

    const id = this.editingId();
    const obs = id !== null
      ? this.service.update(id, { ...payload, id })
      : this.service.create(payload);

    obs.subscribe({
      next: () => {
        this.toastr.success(id !== null ? 'تم تحديث التاجر' : 'تم إضافة التاجر');
        this.cancel();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        const firstFieldError = err?.error?.errors ? Object.values(err.error.errors)[0] : null;
        const msg = err?.error?.message ?? (Array.isArray(firstFieldError) ? firstFieldError[0] : 'فشل الحفظ');
        this.toastr.error(msg);
      },
    });
  }

  askDelete(id: number): void { this.deleteId.set(id); }
  cancelDelete(): void { this.deleteId.set(null); }

  confirmDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.toastr.success('تم حذف التاجر');
        this.deleteId.set(null);
        this.load();
      },
      error: err => {
        this.deleteId.set(null);
        this.toastr.error(err?.error?.message ?? 'فشل الحذف');
      },
    });
  }
}
