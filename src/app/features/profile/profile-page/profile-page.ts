import { Component, OnInit, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../profile.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ChangePasswordRequest,
  Profile,
  UpdateProfileRequest,
} from '../../../shared/Models/profile/profile.models';

function emptyProfileForm(): UpdateProfileRequest {
  return { fullName: '', phoneNumber: '', email: '' };
}

function emptyPasswordForm(): ChangePasswordRequest {
  return { currentPassword: '', newPassword: '' };
}

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
})
export class ProfilePage implements OnInit {
  private service = inject(ProfileService);
  private auth = inject(AuthService);
  private toastr = inject(ToastrService);

  loading = signal<boolean>(true);
  profile = signal<Profile | null>(null);

  profileForm = signal<UpdateProfileRequest>(emptyProfileForm());
  savingProfile = signal<boolean>(false);

  passwordForm = signal<ChangePasswordRequest>(emptyPasswordForm());
  passwordConfirm = signal<string>('');
  savingPassword = signal<boolean>(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.get().subscribe({
      next: p => {
        this.profile.set(p);
        this.profileForm.set({
          fullName: p.fullName,
          phoneNumber: p.phoneNumber,
          email: p.email ?? '',
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateProfileField<K extends keyof UpdateProfileRequest>(key: K, value: UpdateProfileRequest[K]): void {
    this.profileForm.update(f => ({ ...f, [key]: value }));
  }

  updatePasswordField<K extends keyof ChangePasswordRequest>(key: K, value: ChangePasswordRequest[K]): void {
    this.passwordForm.update(f => ({ ...f, [key]: value }));
  }

  saveProfile(): void {
    const f = this.profileForm();
    if (!f.fullName.trim() || !f.phoneNumber.trim()) {
      this.toastr.warning('الاسم ورقم التليفون مطلوبين');
      return;
    }

    this.savingProfile.set(true);
    const payload: UpdateProfileRequest = {
      fullName: f.fullName.trim(),
      phoneNumber: f.phoneNumber.trim(),
      email: f.email?.trim() ? f.email.trim() : null,
    };

    this.service.update(payload).subscribe({
      next: updated => {
        this.savingProfile.set(false);
        this.profile.set(updated);
        this.toastr.success('تم تحديث البيانات. سجل دخولك من جديد لو غيرت رقم التليفون.');
      },
      error: err => {
        this.savingProfile.set(false);
        const firstFieldError = err?.error?.errors ? Object.values(err.error.errors)[0] : null;
        const msg = err?.error?.message ?? (Array.isArray(firstFieldError) ? firstFieldError[0] : 'فشل التحديث');
        this.toastr.error(msg);
      },
    });
  }

  changePassword(): void {
    const f = this.passwordForm();
    const confirm = this.passwordConfirm();
    if (!f.currentPassword || !f.newPassword) {
      this.toastr.warning('من فضلك أدخل كلمة المرور الحالية والجديدة');
      return;
    }
    if (f.newPassword !== confirm) {
      this.toastr.warning('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }
    this.savingPassword.set(true);
    this.service.changePassword(f).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.set(emptyPasswordForm());
        this.passwordConfirm.set('');
        this.toastr.success('تم تغيير كلمة المرور');
      },
      error: err => {
        this.savingPassword.set(false);
        const firstFieldError = err?.error?.errors ? Object.values(err.error.errors)[0] : null;
        const msg = err?.error?.message ?? (Array.isArray(firstFieldError) ? firstFieldError[0] : 'فشل التغيير');
        this.toastr.error(msg);
      },
    });
  }
}
