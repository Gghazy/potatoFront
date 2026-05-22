import { Component, OnInit, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TenantsService } from '../tenants.service';
import { CreateTenantRequest, Tenant } from '../../../shared/Models/tenants/tenant.models';

function emptyForm(): CreateTenantRequest {
  return { name: '', adminEmail: '', adminPassword: '', adminFullName: '' };
}

@Component({
  selector: 'app-tenants-list',
  standalone: false,
  templateUrl: './tenants-list.html',
  styleUrls: ['./tenants-list.css'],
})
export class TenantsList implements OnInit {
  private service = inject(TenantsService);
  private toastr = inject(ToastrService);

  tenants = signal<Tenant[]>([]);
  showModal = signal<boolean>(false);
  deleteId = signal<number | null>(null);
  saving = signal<boolean>(false);
  form = signal<CreateTenantRequest>(emptyForm());

  ngOnInit(): void { this.load(); }

  load(): void {
    this.service.getAll().subscribe(data => this.tenants.set(data));
  }

  updateForm<K extends keyof CreateTenantRequest>(key: K, value: CreateTenantRequest[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  openAdd(): void {
    this.form.set(emptyForm());
    this.showModal.set(true);
  }

  cancel(): void {
    this.form.set(emptyForm());
    this.showModal.set(false);
    this.saving.set(false);
  }

  save(): void {
    const f = this.form();
    if (!f.name.trim() || !f.adminEmail.trim() || !f.adminPassword || !f.adminFullName.trim()) {
      this.toastr.warning('من فضلك أدخل كل البيانات');
      return;
    }
    if (f.adminPassword.length < 6) {
      this.toastr.warning('كلمة المرور يجب ألا تقل عن ٦ أحرف');
      return;
    }
    this.saving.set(true);
    this.service.create(f).subscribe({
      next: () => {
        this.toastr.success('تم إنشاء الشركة');
        this.cancel();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        const firstFieldError = err?.error?.errors ? Object.values(err.error.errors)[0] : null;
        const msg = err?.error?.message ?? (Array.isArray(firstFieldError) ? firstFieldError[0] : 'فشل الإنشاء');
        this.toastr.error(msg);
      },
    });
  }

  toggleActive(t: Tenant): void {
    this.service.setActive(t.id, !t.isActive).subscribe({
      next: () => {
        this.toastr.success(t.isActive ? 'تم إلغاء التفعيل' : 'تم التفعيل');
        this.load();
      },
      error: err => this.toastr.error(err?.error?.message ?? 'فشل العملية'),
    });
  }

  askDelete(id: number): void { this.deleteId.set(id); }
  cancelDelete(): void { this.deleteId.set(null); }

  confirmDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.toastr.success('تم حذف الشركة');
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
