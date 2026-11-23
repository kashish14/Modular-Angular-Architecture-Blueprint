import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

/**
 * Protects lazy-loaded feature routes. There is no login screen in this demo,
 * so an unauthenticated visitor is signed in with the mock demo account before
 * the feature bundle is matched and downloaded.
 */
export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  if (auth.isAuthenticated) {
    return true;
  }
  return auth.login({ email: 'admin@example.com', password: 'demo' }).pipe(map(() => true));
};
