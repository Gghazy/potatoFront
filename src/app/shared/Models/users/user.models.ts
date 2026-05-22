export type UserRole = 'Admin' | 'User';

export interface AppUser {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface CreateUserRequest {
  phoneNumber: string;
  password: string;
  fullName: string;
  role: UserRole;
}
