import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { ErrorInterceptor } from './error.interceptor';
import { LoggerService } from '../services/logger.service';

describe('HTTP interceptors', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    localStorage.clear();
    logger = jasmine.createSpyObj('LoggerService', ['error']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: LoggerService, useValue: logger }
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
  });

  it('adds a bearer token when one is stored', () => {
    localStorage.setItem('auth_token', 'abc');
    http.get('/api/ping').subscribe();
    const req = backend.expectOne('/api/ping');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
  });

  it('sends no Authorization header without a token', () => {
    http.get('/api/ping').subscribe();
    const req = backend.expectOne('/api/ping');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('logs and normalises server errors', done => {
    http.get('/api/missing').subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('Server Error (404)');
        expect(logger.error).toHaveBeenCalled();
        done();
      }
    });
    backend.expectOne('/api/missing').flush('nope', { status: 404, statusText: 'Not Found' });
  });
});
