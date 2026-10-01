import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    localStorage.setItem('jwt', 'token');
  });

  afterEach(() => {
    localStorage.removeItem('jwt');
    controller.verify();
  });

  it('sends the token to the API only', () => {
    http.get(`${environment.apiUrl}/api/documents`).subscribe();
    http.get('https://elsewhere.test/data').subscribe();

    expect(controller.expectOne(`${environment.apiUrl}/api/documents`).request.headers.get('Authorization'))
      .toBe('Bearer token');
    expect(controller.expectOne('https://elsewhere.test/data').request.headers.has('Authorization'))
      .toBeFalse();
  });

  it('signs out and goes to the login page when the session has expired', () => {
    http.get(`${environment.apiUrl}/api/documents`).subscribe({ error: () => undefined });
    controller
      .expectOne(`${environment.apiUrl}/api/documents`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('jwt')).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/en/admin/auth');
  });

  it('leaves a failed login alone', () => {
    http.post(`${environment.apiUrl}/login`, {}).subscribe({ error: () => undefined });
    controller
      .expectOne(`${environment.apiUrl}/login`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('jwt')).toBe('token');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
