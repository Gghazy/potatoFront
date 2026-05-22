import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RefrigeratorsService } from '../refrigerators.service';
import {
  CreateRefrigeratorRequest,
  Refrigerator,
  RefrigeratorExpense,
  RefrigeratorExpenseInput,
  RefrigeratorItem,
  RefrigeratorItemInput,
} from '../../../shared/Models/refrigerators/refrigerator.models';

type Mode = 'new' | 'view' | 'edit';

function today(): string { return new Date().toISOString().slice(0, 10); }

function emptyItemInput(): RefrigeratorItemInput {
  return { date: today(), sackCount: 0, weight: 0, description: '' };
}
function emptyExpenseInput(): RefrigeratorExpenseInput {
  return { date: today(), amount: 0, description: '', notes: '' };
}

@Component({
  selector: 'app-refrigerator-form',
  standalone: false,
  templateUrl: './refrigerator-form.html',
  styleUrls: ['./refrigerator-form.css'],
})
export class RefrigeratorForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(RefrigeratorsService);
  private toastr = inject(ToastrService);

  mode = signal<Mode>('view');
  refrigeratorId = signal<number | null>(null);
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);
  saving = signal<boolean>(false);

  loaded = signal<Refrigerator | null>(null);

  // Header form (name + notes)
  headerForm = signal<CreateRefrigeratorRequest>({ name: '', notes: '' });

  // Items
  items = signal<RefrigeratorItem[]>([]);
  showNewItem = signal<boolean>(false);
  itemForm = signal<RefrigeratorItemInput>(emptyItemInput());
  editingItemId = signal<number | null>(null);
  savingItem = signal<boolean>(false);

  // Expenses
  expenses = signal<RefrigeratorExpense[]>([]);
  showNewExpense = signal<boolean>(false);
  expenseForm = signal<RefrigeratorExpenseInput>(emptyExpenseInput());
  editingExpenseId = signal<number | null>(null);
  savingExpense = signal<boolean>(false);

  // Confirm dialogs
  confirmDeleteRefrigerator = signal<boolean>(false);
  confirmDeleteItemId = signal<number | null>(null);
  confirmDeleteExpenseId = signal<number | null>(null);

  // Derived
  isView = computed(() => this.mode() === 'view');
  isEdit = computed(() => this.mode() === 'edit');
  isNew = computed(() => this.mode() === 'new');
  isEditable = computed(() => this.mode() !== 'view');

  totalSackCount = computed(() => this.items().reduce((s, i) => s + (i.sackCount ?? 0), 0));
  totalWeight = computed(() => Math.round(this.items().reduce((s, i) => s + (i.weight ?? 0), 0) * 100) / 100);
  totalExpenses = computed(() => Math.round(this.expenses().reduce((s, e) => s + (e.amount ?? 0), 0) * 100) / 100);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      this.mode.set('new');
      this.headerForm.set({ name: '', notes: '' });
      this.loading.set(false);
      return;
    }

    const id = Number(idParam);
    if (!id) { this.notFound.set(true); this.loading.set(false); return; }
    this.refrigeratorId.set(id);

    this.route.queryParamMap.subscribe(qp => {
      this.mode.set(qp.get('edit') === '1' ? 'edit' : 'view');
    });

    this.load(id);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: r => {
        this.loaded.set(r);
        this.headerForm.set({ name: r.name, notes: r.notes ?? '' });
        this.items.set(r.items ?? []);
        this.expenses.set(r.expenses ?? []);
        this.loading.set(false);
      },
      error: () => { this.notFound.set(true); this.loading.set(false); },
    });
  }

  back(): void { this.router.navigate(['/features/refrigerators']); }

  switchToEdit(): void {
    if (this.refrigeratorId() === null) return;
    this.router.navigate([], { relativeTo: this.route, queryParams: { edit: 1 }, queryParamsHandling: 'merge' });
  }
  cancelEdit(): void {
    if (this.isNew()) { this.back(); return; }
    const orig = this.loaded();
    if (orig) this.headerForm.set({ name: orig.name, notes: orig.notes ?? '' });
    this.router.navigate([], { relativeTo: this.route, queryParams: { edit: null }, queryParamsHandling: 'merge' });
  }

  updateHeaderField<K extends keyof CreateRefrigeratorRequest>(key: K, value: CreateRefrigeratorRequest[K]): void {
    this.headerForm.update(f => ({ ...f, [key]: value }));
  }

  saveHeader(): void {
    const f = this.headerForm();
    if (!f.name.trim()) { this.toastr.warning('من فضلك أدخل اسم التلاجة'); return; }
    this.saving.set(true);
    const id = this.refrigeratorId();
    const payload: CreateRefrigeratorRequest = { name: f.name.trim(), notes: f.notes?.trim() || null };

    const obs = id !== null
      ? this.service.update(id, { ...payload, id })
      : this.service.create(payload);

    obs.subscribe({
      next: saved => {
        this.saving.set(false);
        this.toastr.success(id !== null ? 'تم حفظ التلاجة' : 'تم إضافة التلاجة');
        this.router.navigate(['/features/refrigerators', saved.id]);
      },
      error: err => {
        this.saving.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل الحفظ');
      },
    });
  }

  // ===== Items =====
  openNewItem(): void {
    this.itemForm.set(emptyItemInput());
    this.editingItemId.set(null);
    this.showNewItem.set(true);
  }
  editItem(i: RefrigeratorItem): void {
    this.itemForm.set({
      date: new Date(i.date).toISOString().slice(0, 10),
      sackCount: i.sackCount,
      weight: i.weight,
      description: i.description ?? '',
    });
    this.editingItemId.set(i.id);
    this.showNewItem.set(true);
  }
  cancelItemForm(): void {
    this.showNewItem.set(false);
    this.editingItemId.set(null);
    this.itemForm.set(emptyItemInput());
  }
  updateItemField<K extends keyof RefrigeratorItemInput>(key: K, value: RefrigeratorItemInput[K]): void {
    this.itemForm.update(f => ({ ...f, [key]: value }));
  }
  saveItem(): void {
    const id = this.refrigeratorId();
    if (id === null) return;
    const i = this.itemForm();
    if (!i.sackCount || i.sackCount <= 0) { this.toastr.warning('عدد الشكاير مطلوب'); return; }
    if (!i.weight || i.weight <= 0) { this.toastr.warning('الوزن مطلوب'); return; }

    this.savingItem.set(true);
    const editingId = this.editingItemId();
    const obs = editingId !== null
      ? this.service.updateItem(id, editingId, i)
      : this.service.addItem(id, i);

    obs.subscribe({
      next: saved => {
        this.savingItem.set(false);
        if (editingId !== null) {
          this.items.update(list => list.map(x => x.id === editingId ? saved : x));
          this.toastr.success('تم تحديث العنصر');
        } else {
          this.items.update(list => [saved, ...list]);
          this.toastr.success('تم إضافة العنصر');
        }
        this.cancelItemForm();
      },
      error: err => {
        this.savingItem.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل الحفظ');
      },
    });
  }
  askDeleteItem(id: number): void { this.confirmDeleteItemId.set(id); }
  cancelDeleteItem(): void { this.confirmDeleteItemId.set(null); }
  doDeleteItem(): void {
    const rid = this.refrigeratorId();
    const itemId = this.confirmDeleteItemId();
    if (rid === null || itemId === null) return;
    this.service.deleteItem(rid, itemId).subscribe({
      next: () => {
        this.items.update(list => list.filter(x => x.id !== itemId));
        this.confirmDeleteItemId.set(null);
        this.toastr.success('تم حذف العنصر');
      },
      error: err => {
        this.confirmDeleteItemId.set(null);
        this.toastr.error(err?.error?.message ?? 'فشل الحذف');
      },
    });
  }

  // ===== Expenses =====
  openNewExpense(): void {
    this.expenseForm.set(emptyExpenseInput());
    this.editingExpenseId.set(null);
    this.showNewExpense.set(true);
  }
  editExpense(e: RefrigeratorExpense): void {
    this.expenseForm.set({
      date: new Date(e.date).toISOString().slice(0, 10),
      amount: e.amount,
      description: e.description,
      notes: e.notes ?? '',
    });
    this.editingExpenseId.set(e.id);
    this.showNewExpense.set(true);
  }
  cancelExpenseForm(): void {
    this.showNewExpense.set(false);
    this.editingExpenseId.set(null);
    this.expenseForm.set(emptyExpenseInput());
  }
  updateExpenseField<K extends keyof RefrigeratorExpenseInput>(key: K, value: RefrigeratorExpenseInput[K]): void {
    this.expenseForm.update(f => ({ ...f, [key]: value }));
  }
  saveExpense(): void {
    const id = this.refrigeratorId();
    if (id === null) return;
    const e = this.expenseForm();
    if (!e.amount || e.amount <= 0) { this.toastr.warning('المبلغ مطلوب'); return; }
    if (!e.description.trim()) { this.toastr.warning('وصف المصروف مطلوب'); return; }

    this.savingExpense.set(true);
    const editingId = this.editingExpenseId();
    const payload: RefrigeratorExpenseInput = { ...e, description: e.description.trim(), notes: e.notes?.trim() || null };
    const obs = editingId !== null
      ? this.service.updateExpense(id, editingId, payload)
      : this.service.addExpense(id, payload);

    obs.subscribe({
      next: saved => {
        this.savingExpense.set(false);
        if (editingId !== null) {
          this.expenses.update(list => list.map(x => x.id === editingId ? saved : x));
          this.toastr.success('تم تحديث المصروف');
        } else {
          this.expenses.update(list => [saved, ...list]);
          this.toastr.success('تم إضافة المصروف');
        }
        this.cancelExpenseForm();
      },
      error: err => {
        this.savingExpense.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل الحفظ');
      },
    });
  }
  askDeleteExpense(id: number): void { this.confirmDeleteExpenseId.set(id); }
  cancelDeleteExpense(): void { this.confirmDeleteExpenseId.set(null); }
  doDeleteExpense(): void {
    const rid = this.refrigeratorId();
    const expId = this.confirmDeleteExpenseId();
    if (rid === null || expId === null) return;
    this.service.deleteExpense(rid, expId).subscribe({
      next: () => {
        this.expenses.update(list => list.filter(x => x.id !== expId));
        this.confirmDeleteExpenseId.set(null);
        this.toastr.success('تم حذف المصروف');
      },
      error: err => {
        this.confirmDeleteExpenseId.set(null);
        this.toastr.error(err?.error?.message ?? 'فشل الحذف');
      },
    });
  }

  // ===== Delete refrigerator =====
  askDeleteRefrigerator(): void { this.confirmDeleteRefrigerator.set(true); }
  cancelDeleteRefrigerator(): void { this.confirmDeleteRefrigerator.set(false); }
  doDeleteRefrigerator(): void {
    const id = this.refrigeratorId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.confirmDeleteRefrigerator.set(false);
        this.toastr.success('تم حذف التلاجة');
        this.back();
      },
      error: err => {
        this.confirmDeleteRefrigerator.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل الحذف');
      },
    });
  }
}
