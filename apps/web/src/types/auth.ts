export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TECHNICIAN' | 'VIEWER';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}
