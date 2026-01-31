import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, Credentials, AuthResponse, UserRole } from '../models/user.model';

// Mock user data
const MOCK_USER: User = {
  id: '1',
  email: 'admin@enterprise.com',
  name: 'Admin User',
  role: UserRole.ADMIN,
  avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=4F46E5&color=fff'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check if user is already logged in (from localStorage)
    this.loadStoredUser();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    // Mock authentication - accept any credentials
    return of({
      user: MOCK_USER,
      token: 'mock-jwt-token-' + Date.now()
    }).pipe(
      delay(800), // Simulate network delay
      tap(response => {
        this.setCurrentUser(response.user);
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('current_user', JSON.stringify(response.user));
      })
    );
  }

  logout(): Observable<void> {
    return of(void 0).pipe(
      delay(300),
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
      })
    );
  }

  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(!!user);
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('current_user');
    const token = localStorage.getItem('auth_token');

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);
        this.setCurrentUser(user);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        this.logout();
      }
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
