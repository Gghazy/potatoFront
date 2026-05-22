import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TraderTransactionsService } from '../trader-transactions.service';
import { TradersService } from '../../traders/traders.service';
import {
  AddTraderPaymentRequest,
  CreateTraderTransactionRequest,
  TraderPayment,
  TraderTransaction,
  TraderTransactionItemInput,
} from '../../../shared/Models/trader-transactions/trader-transaction.models';
import { Trader } from '../../../shared/Models/traders/trader.models';
import { toFullImageUrl } from '../../../core/config/config';

const WEIGHT_FACTOR = 1.035;
const KG_PER_TON = 1000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DEFAULT_ITEMS_PER_PAGE = 25;
const ITEMS_PAGE_SIZES = [10, 25, 50, 100] as const;

type Mode = 'new' | 'view' | 'edit';

interface ItemRow extends TraderTransactionItemInput {
  imagePath: string | null;
  pendingFile: File | null;
  pendingPreview: string | null;
}

interface InvoiceForm {
  traderId: number;
  notes: string | null;
  items: ItemRow[];
}

function today(): string { return new Date().toISOString().slice(0, 10); }

function emptyItem(): ItemRow {
  return {
    id: null,
    date: today(),
    description: '',
    weight: 0,
    price: 0,
    hasTare: true,
    hasCommission: true,
    commissionPerTon: 0,
    imagePath: null,
    pendingFile: null,
    pendingPreview: null,
  };
}

function emptyForm(): InvoiceForm {
  return { traderId: 0, notes: '', items: [emptyItem()] };
}

function emptyPaymentForm(): AddTraderPaymentRequest {
  return { date: today(), amount: 0, notes: '' };
}

@Component({
  selector: 'app-trader-transaction-form',
  standalone: false,
  templateUrl: './trader-transaction-form.html',
  styleUrls: ['./trader-transaction-form.css'],
})
export class TraderTransactionForm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(TraderTransactionsService);
  private tradersService = inject(TradersService);
  private toastr = inject(ToastrService);

  readonly imageUrl = toFullImageUrl;
  readonly itemsPageSizes = ITEMS_PAGE_SIZES;

  mode = signal<Mode>('view');
  invoiceId = signal<number | null>(null);
  loading = signal<boolean>(true);
  notFound = signal<boolean>(false);
  saving = signal<boolean>(false);
  uploadingImage = signal<boolean>(false);

  loaded = signal<TraderTransaction | null>(null);

  form = signal<InvoiceForm>(emptyForm());
  traders = signal<Trader[]>([]);
  existingPayments = signal<TraderPayment[]>([]);

  // Items pagination (client-side over the form items array)
  itemsPage = signal<number>(1);
  itemsPageSize = signal<number>(DEFAULT_ITEMS_PER_PAGE);
  readonly itemsTotalPages = computed(() => Math.max(1, Math.ceil(this.form().items.length / this.itemsPageSize())));
  readonly visibleItems = computed(() => {
    const start = (this.itemsPage() - 1) * this.itemsPageSize();
    return this.form().items.slice(start, start + this.itemsPageSize());
  });
  readonly visibleItemsStart = computed(() => (this.itemsPage() - 1) * this.itemsPageSize());

  showNewPayment = signal<boolean>(false);
  paymentForm = signal<AddTraderPaymentRequest>(emptyPaymentForm());
  savingPayment = signal<boolean>(false);

  lightboxSrc = signal<string | null>(null);

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
  itemCommission = (i: ItemRow) => i.hasCommission
    ? Math.round((this.itemNetWeight(i) / KG_PER_TON) * (i.commissionPerTon ?? 0) * 100) / 100
    : 0;

  totalNetWeight = computed(() => this.form().items.reduce((s, i) => s + this.itemNetWeight(i), 0));
  totalAmount = computed(() => this.form().items.reduce((s, i) => s + this.itemAmount(i), 0));
  totalCommission = computed(() => this.form().items.reduce((s, i) => s + this.itemCommission(i), 0));
  totalPaid = computed(() => this.existingPayments().reduce((s, p) => s + (p.amount ?? 0), 0));
  remaining = computed(() => Math.max(0, Math.round((this.totalAmount() - this.totalPaid()) * 100) / 100));
  isFullyPaid = computed(() => this.totalAmount() > 0 && this.totalPaid() >= this.totalAmount());

  trackByIndex = (index: number) => index;

  ngOnInit(): void {
    this.loadTraders();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
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

  private applyLoadedToForm(t: TraderTransaction): void {
    this.form.set({
      traderId: t.traderId,
      notes: t.notes ?? '',
      items: t.items.length > 0
        ? t.items.map(i => ({
            id: i.id,
            date: new Date(i.date).toISOString().slice(0, 10),
            description: i.description ?? '',
            weight: i.weight,
            price: i.price,
            hasTare: i.hasTare,
            hasCommission: i.hasCommission,
            commissionPerTon: i.commissionPerTon,
            imagePath: i.imagePath,
            pendingFile: null,
            pendingPreview: null,
          } as ItemRow))
        : [emptyItem()],
    });
    this.existingPayments.set(t.payments ?? []);
    this.showNewPayment.set(false);
    this.itemsPage.set(1);
  }

  private loadTraders(): void {
    this.tradersService.getAll().subscribe(list => this.traders.set(list));
  }

  back(): void { this.router.navigate(['/features/trader-transactions']); }
  goToTraders(): void { this.router.navigate(['/features/traders']); }

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

  updateHeader<K extends 'traderId' | 'notes'>(key: K, value: InvoiceForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  updateItemField(absoluteIndex: number, key: 'date' | 'description' | 'weight' | 'price' | 'commissionPerTon', value: string | number | null): void {
    this.form.update(f => {
      const items = f.items.slice();
      const current = { ...items[absoluteIndex] };
      if (key === 'date') current.date = (value as string) ?? today();
      if (key === 'description') current.description = (value as string) ?? '';
      if (key === 'weight') current.weight = value === '' || value === null ? 0 : +value;
      if (key === 'price') current.price = value === '' || value === null ? 0 : +value;
      if (key === 'commissionPerTon') current.commissionPerTon = value === '' || value === null ? 0 : +value;
      items[absoluteIndex] = current;
      return { ...f, items };
    });
  }

  toggleItemTare(absoluteIndex: number): void {
    this.form.update(f => {
      const items = f.items.slice();
      items[absoluteIndex] = { ...items[absoluteIndex], hasTare: !items[absoluteIndex].hasTare };
      return { ...f, items };
    });
  }

  toggleItemCommission(absoluteIndex: number): void {
    this.form.update(f => {
      const items = f.items.slice();
      items[absoluteIndex] = { ...items[absoluteIndex], hasCommission: !items[absoluteIndex].hasCommission };
      return { ...f, items };
    });
  }

  addItem(): void {
    this.form.update(f => ({ ...f, items: [...f.items, emptyItem()] }));
    // Jump to last page so the user sees the new row
    this.itemsPage.set(this.itemsTotalPages());
  }

  removeItem(absoluteIndex: number): void {
    this.form.update(f => {
      const items = f.items.slice();
      items.splice(absoluteIndex, 1);
      return { ...f, items };
    });
    if (this.itemsPage() > this.itemsTotalPages()) this.itemsPage.set(this.itemsTotalPages());
  }

  goToItemsPage(p: number): void {
    if (p < 1 || p > this.itemsTotalPages() || p === this.itemsPage()) return;
    this.itemsPage.set(p);
  }
  onItemsPageSizeChange(value: number | string): void {
    this.itemsPageSize.set(+value);
    this.itemsPage.set(1);
  }

  save(): void {
    const f = this.form();
    if (!f.traderId || f.traderId <= 0) { this.toastr.warning('من فضلك اختر التاجر'); return; }
    if (f.items.length === 0 || f.items.some(i => !i.weight || i.weight <= 0)) {
      this.toastr.warning('من فضلك أدخل عنصر واحد على الأقل بوزن صحيح');
      return;
    }
    if (f.items.some(i => !i.date)) {
      this.toastr.warning('كل عنصر لازم يكون له تاريخ');
      return;
    }

    this.saving.set(true);
    const id = this.invoiceId();
    const payload: CreateTraderTransactionRequest = {
      traderId: f.traderId,
      notes: f.notes,
      items: f.items.map(i => ({
        id: i.id ?? null,
        date: i.date,
        description: i.description?.toString().trim() || null,
        weight: i.weight,
        price: i.price,
        hasTare: i.hasTare,
        hasCommission: i.hasCommission,
        commissionPerTon: i.commissionPerTon,
      })),
    };

    const obs = id !== null
      ? this.service.update(id, { ...payload, id })
      : this.service.create(payload);

    obs.subscribe({
      next: saved => this.uploadPendingItemImages(saved, id !== null),
      error: err => {
        this.saving.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل الحفظ');
      },
    });
  }

  private uploadPendingItemImages(saved: TraderTransaction, isEdit: boolean): void {
    // saved.items come back ordered by Date asc (DTO sort). Match by id where possible,
    // otherwise by position relative to the form items.
    const formItems = this.form().items;
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
      next: () => { this.uploadingImage.set(false); this.finishSave(saved, isEdit); },
      error: err => {
        this.uploadingImage.set(false);
        this.toastr.warning('تم حفظ الفاتورة لكن فشل رفع بعض الصور: ' + (err?.error?.message ?? ''));
        this.finishSave(saved, isEdit);
      },
    });
  }

  private finishSave(saved: TraderTransaction, isEdit: boolean): void {
    this.saving.set(false);
    this.toastr.success(isEdit ? 'تم تحديث الفاتورة' : 'تم إضافة الفاتورة');
    this.router.navigate(['/features/trader-transactions', saved.id]);
  }

  onItemFileSelected(absoluteIndex: number, event: Event): void {
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
        items[absoluteIndex] = { ...items[absoluteIndex], pendingFile: file, pendingPreview: dataUrl };
        return { ...f, items };
      });
    };
    reader.readAsDataURL(file);
  }

  clearItemPendingFile(absoluteIndex: number): void {
    this.form.update(f => {
      const items = f.items.slice();
      items[absoluteIndex] = { ...items[absoluteIndex], pendingFile: null, pendingPreview: null };
      return { ...f, items };
    });
  }

  removeItemImage(absoluteIndex: number): void {
    const row = this.form().items[absoluteIndex];
    const transactionId = this.invoiceId();
    if (!row.id || transactionId === null) return;
    this.service.deleteItemImage(transactionId, row.id).subscribe({
      next: () => {
        this.toastr.success('تم حذف الصورة');
        this.form.update(f => {
          const items = f.items.slice();
          items[absoluteIndex] = { ...items[absoluteIndex], imagePath: null };
          return { ...f, items };
        });
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل حذف الصورة'),
    });
  }

  openLightbox(src: string | null): void { if (src) this.lightboxSrc.set(src); }
  closeLightbox(): void { this.lightboxSrc.set(null); }

  openNewPayment(): void {
    this.paymentForm.set({ ...emptyPaymentForm(), amount: this.remaining() > 0 ? this.remaining() : 0 });
    this.showNewPayment.set(true);
  }
  cancelNewPayment(): void { this.showNewPayment.set(false); this.paymentForm.set(emptyPaymentForm()); }
  updatePaymentField<K extends keyof AddTraderPaymentRequest>(key: K, value: AddTraderPaymentRequest[K]): void {
    this.paymentForm.update(p => ({ ...p, [key]: value }));
  }
  saveNewPayment(): void {
    const id = this.invoiceId();
    if (id === null) return;
    const p = this.paymentForm();
    if (!p.amount || p.amount <= 0) {
      this.toastr.warning('من فضلك أدخل مبلغ الدفعة');
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
  deletePaymentRow(payment: TraderPayment): void {
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
