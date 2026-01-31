export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
