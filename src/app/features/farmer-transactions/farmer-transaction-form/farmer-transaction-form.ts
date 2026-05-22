import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FarmerTransactionsService } from '../farmer-transactions.service';
import { FarmersService } from '../../farmers/farmers.service';
import {
  AddPaymentRequest,
  CreateFarmerTransactionRequest,
  FarmerPayment,
  FarmerTransaction,
  FarmerTransactionItemInput,
} from '../../../shared/Models/farmer-transactions/farmer-transaction.models';
import { Farmer } from '../../../shared/Models/farmers/farmer.models';
import { toFullImageUrl } from '../../../core/config/config';

const WEIGHT_FACTOR = 1.035;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type Mode = 'new' | 'view' | 'edit';

interface ItemRow extends FarmerTransactionItemInput {
  imagePath: string | null;
  pendingFile: File | null;
  pendingPreview: string | null;
}

interface InvoiceForm {
  date: string;
  farmerId: number;
  notes: string | null;
  items: ItemRow[];
}

function emptyItem(): ItemRow {
  return { id: null, description: '', weight: 0, price: 0, hasTare: true, imagePath: null, pendingFile: null, pendingPreview: null };
}

function emptyForm(): InvoiceForm {
  return {
    date: new Date().toISOString().slice(0, 10),
    farmerId: 0,
    notes: '',
    items: [emptyItem()],
  };
}

function emptyPaymentForm(): AddPaymentRequest {
  return {
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    notes: '',
  };
}

@Component({
  selector: 'app-farmer-transaction-form',
  standalone: false,
  templateUrl: './farmer-transaction-form.html',
  styleUrls: ['./farmer-transaction-form.css'],
})
export class FarmerTransactionForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(FarmerTransactionsService);
  private farmersService = inject(FarmersService);
  private toastr = inject(ToastrService);

  readonly imageUrl = toFullImageUrl;

  mode = signal<Mode>('view');
  invoiceId = signal<number | null>(null);
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);
  saving = signal<boolean>(false);
  uploadingImage = signal<boolean>(false);

  // Loaded invoice state (kept for cancelling out of edit + close/reopen actions)
  loaded = signal<FarmerTransaction | null>(null);

  // Form state
  form = signal<InvoiceForm>(emptyForm());
  farmers = signal<Farmer[]>([]);
  existingPayments = signal<FarmerPayment[]>([]);
  // Pending payments staged on the new-invoice form, submitted together with create.
  pendingPayments = signal<AddPaymentRequest[]>([]);

  // Payments inline form
  showNewPayment = signal<boolean>(false);
  paymentForm = signal<AddPaymentRequest>(emptyPaymentForm());
  savingPayment = signal<boolean>(false);

  // Lightbox
  lightboxSrc = signal<string | null>(null);

  // Computed helpers
  isView = computed(() => this.mode() === 'view');
  isEdit = computed(() => this.mode() === 'edit');
  isNew = computed(() => this.mode() === 'new');
  isEditable = computed(() => this.mode() !== 'view');
  isClosed = computed(() => this.loaded()?.isClosed ?? false);

  itemNetWeight = (i: ItemRow) => {
    const w = i.weight ?? 0;
    return i.hasTare
      ? Math.round((w / WEIGHT_FACTOR) * 100) / 100
      : Math.round(w * 100) / 100;
  };
  itemAmount = (i: ItemRow) => Math.round(this.itemNetWeight(i) * (i.price ?? 0) * 100) / 100;
  totalNetWeight = computed(() => this.form().items.reduce((s, i) => s + this.itemNetWeight(i), 0));
  totalAmount = computed(() => this.form().items.reduce((s, i) => s + this.itemAmount(i), 0));
  totalPaid = computed(() =>
    this.existingPayments().reduce((s, p) => s + (p.amount ?? 0), 0)
    + this.pendingPayments().reduce((s, p) => s + (p.amount ?? 0), 0)
  );
  remaining = computed(() => Math.max(0, Math.round((this.totalAmount() - this.totalPaid()) * 100) / 100));
  isFullyPaid = computed(() => this.totalAmount() > 0 && this.totalPaid() >= this.totalAmount());

  trackByIndex = (index: number) => index;

  ngOnInit(): void {
    this.loadFarmers();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      // /new route
      this.mode.set('new');
      this.form.set(emptyForm());
      this.loading.set(false);
      return;
    }

    const id = Number(idParam);
    if (!id) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.invoiceId.set(id);

    this.route.queryParamMap.subscribe(qp => {
      const wantEdit = qp.get('edit') === '1';
      this.mode.set(wantEdit ? 'edit' : 'view');
    });

    this.load(id);
  }

  private load(id: number): void {
    this.loading.set(true);
    this.service.get(id).subscribe({
      next: t => {
        this.loaded.set(t);
        this.applyLoadedToForm(t);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  private applyLoadedToForm(t: FarmerTransaction): void {
    this.form.set({
      date: new Date(t.date).toISOString().slice(0, 10),
      farmerId: t.farmerId,
      notes: t.notes ?? '',
      items: t.items.length > 0
        ? t.items.map(i => ({
            id: i.id,
            description: i.description ?? '',
            weight: i.weight,
            price: i.price,
            hasTare: i.hasTare,
            imagePath: i.imagePath,
            pendingFile: null,
            pendingPreview: null,
          } as ItemRow))
        : [emptyItem()],
    });
    this.existingPayments.set(t.payments ?? []);
    this.pendingPayments.set([]);
    this.showNewPayment.set(false);
  }

  private loadFarmers(): void {
    this.farmersService.getAll().subscribe(list => this.farmers.set(list));
  }

  back(): void { this.router.navigate(['/features/farmer-transactions']); }

  goToFarmers(): void { this.router.navigate(['/features/farmers']); }

  // ===== Mode switching =====
  switchToEdit(): void {
    if (this.invoiceId() === null) return;
    if (this.isClosed()) {
      this.toastr.warning('الفاتورة مغلقة — اضغط "فتح" أولاً عشان تعدلها');
      return;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams: { edit: 1 }, queryParamsHandling: 'merge' });
  }

  cancelEdit(): void {
    if (this.isNew()) { this.back(); return; }
    const orig = this.loaded();
    if (orig) this.applyLoadedToForm(orig);
    this.router.navigate([], { relativeTo: this.route, queryParams: { edit: null }, queryParamsHandling: 'merge' });
  }

  // ===== Header / item form helpers =====
  updateHeader<K extends 'date' | 'farmerId' | 'notes'>(key: K, value: InvoiceForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  updateItemField(index: number, key: 'description' | 'weight' | 'price', value: string | number | null): void {
    this.form.update(f => {
      const items = f.items.slice();
      const current = { ...items[index] };
      if (key === 'description') current.description = (value as string) ?? '';
      if (key === 'weight') current.weight = value === '' || value === null ? 0 : +value;
      if (key === 'price') current.price = value === '' || value === null ? 0 : +value;
      items[index] = current;
      return { ...f, items };
    });
  }

  toggleItemTare(index: number): void {
    this.form.update(f => {
      const items = f.items.slice();
      items[index] = { ...items[index], hasTare: !items[index].hasTare };
      return { ...f, items };
    });
  }

  addItem(): void {
    this.form.update(f => ({ ...f, items: [...f.items, emptyItem()] }));
  }

  removeItem(index: number): void {
    this.form.update(f => {
      const items = f.items.slice();
      items.splice(index, 1);
      return { ...f, items };
    });
  }

  // ===== Save invoice (then upload pending item images) =====
  save(): void {
    const f = this.form();
    if (!f.farmerId || f.farmerId <= 0) { this.toastr.warning('من فضلك اختر الفلاح'); return; }

    // Treat rows with weight <= 0 as empty placeholders and drop them.
    // Allows saving an invoice with no items yet (e.g. to record an advance payment first).
    const validItems = f.items.filter(i => i.weight && i.weight > 0);

    this.saving.set(true);
    const id = this.invoiceId();
    const isNewInvoice = id === null;
    const stagedPayments = isNewInvoice ? this.pendingPayments() : [];
    const payload: CreateFarmerTransactionRequest = {
      date: f.date,
      farmerId: f.farmerId,
      notes: f.notes,
      items: validItems.map(i => ({
        id: i.id ?? null,
        description: i.description?.toString().trim() || null,
        weight: i.weight,
        price: i.price,
        hasTare: i.hasTare,
      })),
      ...(stagedPayments.length > 0 && {
        payments: stagedPayments.map(p => ({
          date: p.date,
          amount: p.amount,
          notes: p.notes ?? null,
        })),
      }),
    };

    const obs = !isNewInvoice
      ? this.service.update(id!, { ...payload, id: id! })
      : this.service.create(payload);

    obs.subscribe({
      next: saved => this.uploadPendingItemImages(saved, id !== null),
      error: err => {
        this.saving.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل الحفظ');
      },
    });
  }

  private uploadPendingItemImages(saved: FarmerTransaction, isEdit: boolean): void {
    // Match by the same filter used in save() so indexes align with saved.items.
    const formItems = this.form().items.filter(i => i.weight && i.weight > 0);
    const pending: { itemId: number; file: File }[] = [];
    for (let i = 0; i < saved.items.length && i < formItems.length; i++) {
      const formRow = formItems[i];
      if (formRow.pendingFile) {
        pending.push({ itemId: saved.items[i].id, file: formRow.pendingFile });
      }
    }
    if (pending.length === 0) { this.finishSave(saved, isEdit); return; }

    this.uploadingImage.set(true);
    forkJoin(pending.map(p => this.service.uploadItemImage(saved.id, p.itemId, p.file))).subscribe({
      next: () => {
        this.uploadingImage.set(false);
        this.finishSave(saved, isEdit);
      },
      error: err => {
        this.uploadingImage.set(false);
        this.toastr.warning('تم حفظ الفاتورة لكن فشل رفع بعض الصور: ' + (err?.error?.message ?? ''));
        this.finishSave(saved, isEdit);
      },
    });
  }

  private finishSave(saved: FarmerTransaction, isEdit: boolean): void {
    this.saving.set(false);
    this.toastr.success(isEdit ? 'تم تحديث الفاتورة' : 'تم إضافة الفاتورة');
    // After save: go to view mode for this invoice
    this.router.navigate(['/features/farmer-transactions', saved.id]);
  }

  // ===== Per-item image handlers =====
  onItemFileSelected(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      this.toastr.warning('الحد الأقصى لحجم الصورة 5 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.form.update(f => {
        const items = f.items.slice();
        items[index] = { ...items[index], pendingFile: file, pendingPreview: dataUrl };
        return { ...f, items };
      });
    };
    reader.readAsDataURL(file);
  }

  clearItemPendingFile(index: number): void {
    this.form.update(f => {
      const items = f.items.slice();
      items[index] = { ...items[index], pendingFile: null, pendingPreview: null };
      return { ...f, items };
    });
  }

  removeItemImage(index: number): void {
    const row = this.form().items[index];
    const transactionId = this.invoiceId();
    if (!row.id || transactionId === null) return;
    this.service.deleteItemImage(transactionId, row.id).subscribe({
      next: () => {
        this.toastr.success('تم حذف الصورة');
        this.form.update(f => {
          const items = f.items.slice();
          items[index] = { ...items[index], imagePath: null };
          return { ...f, items };
        });
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل حذف الصورة'),
    });
  }

  openLightbox(src: string | null): void { if (src) this.lightboxSrc.set(src); }
  closeLightbox(): void { this.lightboxSrc.set(null); }

  // ===== Payments =====
  openNewPayment(): void {
    this.paymentForm.set({ ...emptyPaymentForm(), amount: this.remaining() > 0 ? this.remaining() : 0 });
    this.showNewPayment.set(true);
  }
  cancelNewPayment(): void { this.showNewPayment.set(false); this.paymentForm.set(emptyPaymentForm()); }
  updatePaymentField<K extends keyof AddPaymentRequest>(key: K, value: AddPaymentRequest[K]): void {
    this.paymentForm.update(p => ({ ...p, [key]: value }));
  }
  saveNewPayment(): void {
    const p = this.paymentForm();
    if (!p.amount || p.amount <= 0) {
      this.toastr.warning('من فضلك أدخل مبلغ الدفعة');
      return;
    }
    // In new mode (no invoice id yet) just stage the payment locally; it'll be saved with the invoice.
    const id = this.invoiceId();
    if (id === null) {
      this.pendingPayments.update(list => [{ ...p }, ...list]);
      this.cancelNewPayment();
      return;
    }
    this.savingPayment.set(true);
    this.service.addPayment(id, p).subscribe({
      next: payment => {
        this.savingPayment.set(false);
        this.existingPayments.update(list => [payment, ...list]);
        this.cancelNewPayment();
        this.toastr.success('تم إضافة الدفعة');
      },
      error: err => {
        this.savingPayment.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل إضافة الدفعة');
      },
    });
  }
  removePendingPayment(index: number): void {
    this.pendingPayments.update(list => list.filter((_, i) => i !== index));
  }
  deletePaymentRow(payment: FarmerPayment): void {
    const id = this.invoiceId();
    if (id === null) return;
    this.service.deletePayment(id, payment.id).subscribe({
      next: () => {
        this.existingPayments.update(list => list.filter(p => p.id !== payment.id));
        this.toastr.success('تم حذف الدفعة');
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل حذف الدفعة'),
    });
  }

  // ===== Close / Reopen / Delete (from view mode) =====
  closeInvoice(): void {
    const id = this.invoiceId();
    if (id === null) return;
    this.service.close(id).subscribe({
      next: t => {
        this.loaded.set(t);
        this.applyLoadedToForm(t);
        this.toastr.success('تم إغلاق الفاتورة');
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل الإغلاق'),
    });
  }

  reopenInvoice(): void {
    const id = this.invoiceId();
    if (id === null) return;
    this.service.reopen(id).subscribe({
      next: t => {
        this.loaded.set(t);
        this.applyLoadedToForm(t);
        this.toastr.success('تم إعادة فتح الفاتورة');
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل إعادة الفتح'),
    });
  }

  confirmDelete = signal<boolean>(false);
  askDelete(): void { this.confirmDelete.set(true); }
  cancelDelete(): void { this.confirmDelete.set(false); }
  doDelete(): void {
    const id = this.invoiceId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.confirmDelete.set(false);
        this.toastr.success('تم حذف الفاتورة');
        this.back();
      },
      error: err => {
        this.confirmDelete.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل الحذف');
      },
    });
  }
}
