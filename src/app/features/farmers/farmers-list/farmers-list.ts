import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FarmersService } from '../farmers.service';
import {
  CreateFarmerRequest,
  EGYPT_PHONE_REGEX,
  Farmer,
} from '../../../shared/Models/farmers/farmer.models';

function emptyForm(): CreateFarmerRequest {
  return { name: '', phoneNumber: '' };
}

@Component({
  selector: 'app-farmers-list',
  standalone: false,
  templateUrl: './farmers-list.html',
  styleUrls: ['./farmers-list.css'],
})
export class FarmersList implements OnInit {
  private service = inject(FarmersService);
  private toastr = inject(ToastrService);

  farmers = signal<Farmer[]>([]);
  loading = signal<boolean>(false);
  search = signal<string>('');

  showModal = signal<boolean>(false);
  saving = signal<boolean>(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  form = signal<CreateFarmerRequest>(emptyForm());

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
        this.farmers.set(data);
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

  updateForm<K extends keyof CreateFarmerRequest>(key: K, value: CreateFarmerRequest[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  openAdd(): void {
    this.form.set(emptyForm());
    this.editingId.set(null);
    this.showModal.set(true);
  }

  edit(f: Farmer): void {
    this.form.set({ name: f.name, phoneNumber: f.phoneNumber ?? '' });
    this.editingId.set(f.id);
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
      this.toastr.warning('من فضلك أدخل اسم الفلاح');
      return;
    }
    const phone = (f.phoneNumber ?? '').trim();
    if (phone && !EGYPT_PHONE_REGEX.test(phone)) {
      this.toastr.warning('رقم التليفون يجب أن يكون رقم مصرى صحيح (مثال: 01012345678)');
      return;
    }

    this.saving.set(true);
    const payload: CreateFarmerRequest = {
      name: f.name.trim(),
      phoneNumber: phone || null,
    };

    const id = this.editingId();
    const obs = id !== null
      ? this.service.update(id, { ...payload, id })
      : this.service.create(payload);

    obs.subscribe({
      next: () => {
        this.toastr.success(id !== null ? 'تم تحديث الفلاح' : 'تم إضافة الفلاح');
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
        this.toastr.success('تم حذف الفلاح');
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
