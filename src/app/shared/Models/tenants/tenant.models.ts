export interface Tenant {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  usersCount: number;
}

export interface CreateTenantRequest {
  name: string;
  adminEmail: string;
  adminPassword: string;
  adminFullName: string;
}
