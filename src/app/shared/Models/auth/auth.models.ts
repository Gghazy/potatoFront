export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: string;
  tenantId: number | null;
  tenantName: string | null;
  expiresAt: string;
}
