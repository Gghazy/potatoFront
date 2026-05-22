import { Component, OnInit, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../users.service';
import { AppUser, CreateUserRequest, UserRole } from '../../../shared/Models/users/user.models';
import { AuthService } from '../../../core/services/auth.service';

function emptyForm(): CreateUserRequest {
  return { phoneNumber: '', password: '', fullName: '', role: 'User' };
}

@Component({
  selector: 'app-users-list',
  standalone: false,
  templateUrl: './users-list.html',
  styleUrls: ['./users-list.css'],
})
export class UsersList implements OnInit {
  private service = inject(UsersService);
  private toastr = inject(ToastrService);
  private auth = inject(AuthService);

  users = signal<AppUser[]>([]);
  showModal = signal<boolean>(false);
  deleteId = signal<string | null>(null);
  saving = signal<boolean>(false);
  form = signal<CreateUserRequest>(emptyForm());

  readonly currentUserId = this.auth.userId;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.service.getAll().subscribe(data => this.users.set(data));
  }

  updateForm<K extends keyof CreateUserRequest>(key: K, value: CreateUserRequest[K]): void {
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
    if (!f.fullName.trim() || !f.phoneNumber.trim() || !f.password) {
      this.toastr.warning('من فضلك أدخل كل البيانات');
      return;
    }

    this.saving.set(true);
    this.service.create({ ...f, phoneNumber: f.phoneNumber.trim() }).subscribe({
      next: () => {
        this.toastr.success('تم إضافة المستخدم');
        this.cancel();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        const firstFieldError = err?.error?.errors ? Object.values(err.error.errors)[0] : null;
        const msg = err?.error?.message ?? (Array.isArray(firstFieldError) ? firstFieldError[0] : 'فشل الإضافة');
        this.toastr.error(msg);
      },
    });
  }

  askDelete(id: string): void {
    if (id === this.currentUserId()) {
      this.toastr.warning('لا يمكنك حذف حسابك الخاص');
      return;
    }
    this.deleteId.set(id);
  }

  cancelDelete(): void { this.deleteId.set(null); }

  confirmDelete(): void {
    const id = this.deleteId();
    if (id === null) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.toastr.success('تم حذف المستخدم');
        this.deleteId.set(null);
        this.load();
      },
      error: err => {
        this.deleteId.set(null);
        this.toastr.error(err?.error?.message ?? 'فشل الحذف');
      },
    });
  }

  roleLabel(role: UserRole): string {
    return role === 'Admin' ? 'مدير' : 'مستخدم';
  }
}
