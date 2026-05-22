import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SeasonsService } from '../seasons.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import {
  CreateSeasonRequest,
  Season,
} from '../../../shared/Models/seasons/season.models';

function emptyForm(): CreateSeasonRequest {
  return { name: '', notes: '' };
}

@Component({
  selector: 'app-seasons-list',
  standalone: false,
  templateUrl: './seasons-list.html',
  styleUrls: ['./seasons-list.css'],
})
export class SeasonsList implements OnInit {
  private service = inject(SeasonsService);
  private context = inject(SeasonContextService);
  private toastr = inject(ToastrService);

  seasons = signal<Season[]>([]);
  loading = signal<boolean>(false);

  showModal = signal<boolean>(false);
  saving = signal<boolean>(false);
  editingId = signal<number | null>(null);
  deleteId = signal<number | null>(null);

  form = signal<CreateSeasonRequest>(emptyForm());

  hasSeasons = computed(() => this.seasons().length > 0);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: data => {
        this.seasons.set(data);
        this.context.seasons.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateForm<K extends keyof CreateSeasonRequest>(key: K, value: CreateSeasonRequest[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  openAdd(): void {
    this.form.set(emptyForm());
    this.editingId.set(null);
    this.showModal.set(true);
  }

  edit(s: Season): void {
    this.form.set({ name: s.name, notes: s.notes ?? '' });
    this.editingId.set(s.id);
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
      this.toastr.warning('من فضلك أدخل اسم الموسم');
      return;
    }
    this.saving.set(true);
    const payload: CreateSeasonRequest = {
      name: f.name.trim(),
      notes: f.notes?.trim() || null,
    };

    const id = this.editingId();
    const obs = id !== null
      ? this.service.update(id, { ...payload, id })
      : this.service.create(payload);

    obs.subscribe({
      next: () => {
        this.toastr.success(id !== null ? 'تم تحديث الموسم' : 'تم إضافة الموسم');
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

  setDefault(s: Season): void {
    if (s.isDefault) return;
    this.service.setDefault(s.id).subscribe({
      next: () => {
        this.toastr.success('تم تحديد الموسم الافتراضى');
        this.load();
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل التحديد'),
    });
  }

  askDelete(id: number): void { this.deleteId.set(id); }
  cancelDelete(): void { this.deleteId.set(null); }

  confirmDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.toastr.success('تم حذف الموسم');
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
