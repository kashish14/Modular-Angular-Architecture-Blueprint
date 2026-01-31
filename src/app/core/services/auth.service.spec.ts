import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be authenticated initially', () => {
    expect(service.isAuthenticated).toBeFalsy();
  });

  it('should authenticate user on login', (done) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password'
    };

    service.login(credentials).subscribe(response => {
      expect(response.user).toBeDefined();
      expect(response.token).toBeDefined();
      expect(service.isAuthenticated).toBeTruthy();
      expect(service.currentUser).toBeDefined();
      done();
    });
  });

  it('should set authentication token in localStorage', (done) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password'
    };

    service.login(credentials).subscribe(() => {
      const token = localStorage.getItem('auth_token');
      expect(token).toBeTruthy();
      done();
    });
  });

  it('should clear authentication on logout', (done) => {
    const credentials = {
      email: 'test@example.com',
      password: 'password'
    };

    service.login(credentials).subscribe(() => {
      service.logout().subscribe(() => {
        expect(service.isAuthenticated).toBeFalsy();
        expect(service.currentUser).toBeNull();
        expect(localStorage.getItem('auth_token')).toBeNull();
        done();
      });
    });
  });
});
