import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

// A JWT whose payload expires at `exp` (seconds); the signature is not checked.
const tokenExpiringAt = (exp: number) => `header.${btoa(JSON.stringify({ exp }))}.signature`;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AuthService);
    localStorage.removeItem('jwt');
  });

  afterEach(() => localStorage.removeItem('jwt'));

  it('is signed out without a token', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('is signed in until the token expires', () => {
    localStorage.setItem('jwt', tokenExpiringAt(Date.now() / 1000 + 60));
    expect(service.isAuthenticated()).toBeTrue();

    localStorage.setItem('jwt', tokenExpiringAt(Date.now() / 1000 - 60));
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('forgets the token on logout', () => {
    localStorage.setItem('jwt', tokenExpiringAt(Date.now() / 1000 + 60));
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
