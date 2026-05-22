import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthApiService } from '../../core/services/auth-api.service';
import { APP_ROUTES } from '../../core/constants/app.constants';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private api = inject(AuthApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  phoneNumber = '';
  password = '';
  loading = signal(false);

  submit(): void {
    if (!this.phoneNumber || !this.password) {
      this.toastr.warning('من فضلك أدخل رقم التليفون وكلمة المرور');
      return;
    }
    this.loading.set(true);
    this.api.login({ phoneNumber: this.phoneNumber.trim(), password: this.password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? APP_ROUTES.FEATURES;
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.loading.set(false);
        this.toastr.error(err?.error?.message ?? 'فشل تسجيل الدخول');
      },
      complete: () => this.loading.set(false),
    });
  }
}
