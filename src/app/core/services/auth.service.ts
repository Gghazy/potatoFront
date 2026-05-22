import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { JWT_CLAIMS, STORAGE_KEYS } from '../constants/app.constants';

export interface JwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
  FullName?: string;
  tenant_id?: string;
  tenant_name?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;
  private readonly storageKey = STORAGE_KEYS.TOKEN;

  readonly isAuthenticated = signal<boolean>(false);

  fullName = signal<string>('');
  email = signal<string>('');
  userId = signal<string>('');
  tenantId = signal<number | null>(null);
  tenantName = signal<string>('');

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isAuthenticated.set(this.hasValidToken());
  }

  private get storage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }

  getToken(): string | null {
    return this.storage?.getItem(this.storageKey) ?? null;
  }

  setToken(token: string | null): void {
    if (!this.isBrowser) return;
    if (token) this.storage!.setItem(this.storageKey, token);
    else this.storage!.removeItem(this.storageKey);

    this.isAuthenticated.set(this.hasValidToken());
  }

  clear(): void {
    if (!this.isBrowser) return;
    this.storage!.removeItem(this.storageKey);
    this.isAuthenticated.set(false);
    this.fullName.set('');
    this.email.set('');
    this.userId.set('');
    this.tenantId.set(null);
    this.tenantName.set('');
  }

  decode<T = JwtPayload>(token?: string | null): T | null {
    try {
      const t = token ?? this.getToken();
      if (!t) return null;

      const parts = t.split('.');
      if (parts.length < 2) return null;

      const json = this.base64UrlDecode(parts[1]);
      return JSON.parse(json) as T;
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const payload = this.decode<JwtPayload>();
    if (!payload) return [];
    const claim = payload[JWT_CLAIMS.ROLE] ?? payload[JWT_CLAIMS.ROLES];
    return this.toStringArray(claim as string | string[] | undefined);
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  get isAdmin(): boolean { return this.hasRole('Admin'); }
  get isSuperAdmin(): boolean { return this.hasRole('SuperAdmin'); }

  isTokenExpired(token?: string | null): boolean {
    const payload = this.decode<JwtPayload>(token);
    if (!payload?.exp) return true;
    return payload.exp <= Math.floor(Date.now() / 1000);
  }

  hasValidToken(): boolean {
    const t = this.getToken();
    if (!t) return false;
    this.loadFromToken();
    return !this.isTokenExpired(t);
  }

  private toStringArray(value?: string[] | string): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
    return String(value).split(',').map(s => s.trim()).filter(Boolean);
  }

  private base64UrlDecode(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
      .padEnd(Math.ceil(input.length / 4) * 4, '=');

    if (this.isBrowser && typeof atob === 'function') {
      const binary = atob(base64);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
    return '';
  }

  private loadFromToken(): void {
    const payload = this.decode<JwtPayload>();
    if (!payload) return;

    this.userId.set(String(payload[JWT_CLAIMS.SUB] ?? ''));
    this.email.set(String(payload[JWT_CLAIMS.EMAIL] ?? ''));
    this.fullName.set(String(payload[JWT_CLAIMS.FULL_NAME] ?? ''));

    const rawTenantId = payload[JWT_CLAIMS.TENANT_ID];
    if (rawTenantId != null && rawTenantId !== '') {
      const n = Number(rawTenantId);
      this.tenantId.set(Number.isFinite(n) ? n : null);
    } else {
      this.tenantId.set(null);
    }
    this.tenantName.set(String(payload[JWT_CLAIMS.TENANT_NAME] ?? ''));
  }
}
