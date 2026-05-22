export interface Profile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: string;
  tenantId: number | null;
  tenantName: string | null;
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  email: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
