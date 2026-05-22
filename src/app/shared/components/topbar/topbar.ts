import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SeasonContextService } from '../../../core/services/season-context.service';
import { APP_ROUTES } from '../../../core/constants/app.constants';
import { APP_CONFIG } from '../../../core/config/config';

interface TopbarLink {
  path: string;
  label: string;
  exact: boolean;
  hideForSuperAdmin?: boolean;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css'],
})
export class Topbar {
  private auth = inject(AuthService);
  private seasonContext = inject(SeasonContextService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  readonly appName = APP_CONFIG.appName;
  readonly fullName = this.auth.fullName;
  readonly email = this.auth.email;
  readonly tenantName = this.auth.tenantName;

  // Season switcher state — only visible for tenant users, not SuperAdmin.
  readonly seasons = this.seasonContext.seasons;
  readonly selectedSeason = this.seasonContext.selectedSeason;
  readonly showSeasonSwitcher = computed(() =>
    this.auth.isAuthenticated() && !this.auth.isSuperAdmin
  );
  seasonMenuOpen = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);

  toggleSeasonMenu(): void { this.seasonMenuOpen.update(v => !v); }
  closeSeasonMenu(): void { this.seasonMenuOpen.set(false); }
  toggleMobileMenu(): void { this.mobileMenuOpen.update(v => !v); }
  closeMobileMenu(): void { this.mobileMenuOpen.set(false); }
  selectSeason(id: number | null): void {
    if (this.seasonContext.selectedSeasonId() === id) {
      this.closeSeasonMenu();
      return;
    }
    this.seasonContext.setSelectedSeason(id);
    this.closeSeasonMenu();
    this.closeMobileMenu();
    // Full reload — guarantees every list/dashboard re-fetches under the new season scope
    // without having to wire reactive refetch into every feature module.
    window.location.reload();
  }
  goToSeasonsPage(): void {
    this.closeSeasonMenu();
    this.closeMobileMenu();
    this.router.navigate([APP_ROUTES.FEATURES_SEASONS]);
  }
  onNavLinkClick(): void { this.closeMobileMenu(); }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (!this.seasonMenuOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.closeSeasonMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    // Auto-close the mobile menu when crossing back to desktop width.
    if (window.innerWidth >= 992 && this.mobileMenuOpen()) this.closeMobileMenu();
  }

  private readonly allLinks: TopbarLink[] = [
    { path: APP_ROUTES.FEATURES_HOME, label: 'الرئيسية', exact: true, hideForSuperAdmin: true },
    { path: APP_ROUTES.FEATURES_FARMERS, label: 'الفلاحين', exact: false, hideForSuperAdmin: true },
    { path: APP_ROUTES.FEATURES_FARMER_INVOICES, label: 'فواتير الفلاحين', exact: false, hideForSuperAdmin: true },
    { path: APP_ROUTES.FEATURES_TRADERS, label: 'التجار', exact: false, hideForSuperAdmin: true },
    { path: APP_ROUTES.FEATURES_TRADER_INVOICES, label: 'فواتير التجار', exact: false, hideForSuperAdmin: true },
    { path: APP_ROUTES.FEATURES_REFRIGERATORS, label: 'التلاجات', exact: false, hideForSuperAdmin: true },
    { path: APP_ROUTES.FEATURES_EXPENSES, label: 'المصاريف', exact: false, hideForSuperAdmin: true },
    { path: APP_ROUTES.FEATURES_USERS, label: 'المستخدمين', exact: false, adminOnly: true },
    { path: APP_ROUTES.FEATURES_TENANTS, label: 'الشركات', exact: false, superAdminOnly: true },
  ];

  readonly links = computed(() => {
    if (!this.auth.isAuthenticated()) return [];
    const isAdmin = this.auth.isAdmin;
    const isSuperAdmin = this.auth.isSuperAdmin;

    return this.allLinks.filter(l => {
      if (l.superAdminOnly && !isSuperAdmin) return false;
      if (l.adminOnly && !isAdmin && !isSuperAdmin) return false;
      if (l.hideForSuperAdmin && isSuperAdmin) return false;
      return true;
    });
  });

  goToProfile(): void {
    this.closeMobileMenu();
    this.router.navigate([APP_ROUTES.FEATURES_PROFILE]);
  }

  logout(): void {
    this.auth.clear();
    this.seasonContext.clear();
    this.router.navigate([APP_ROUTES.AUTH_LOGIN]);
  }
}
