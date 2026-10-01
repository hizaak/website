import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AbstractRequestService } from './abstract-request.service';
import { API_ENDPOINTS } from '../../core/api-endpoints';

// Where the admin session token is kept. Only in the browser: pages are
// also rendered at build time, where there is no storage and no session.
const TOKEN_KEY = 'jwt';

export function getStoredToken(): string | null {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
}

interface LoginResponse {
  message: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.post<LoginResponse>(API_ENDPOINTS.auth.login, { username, password }).pipe(
      tap((response) => localStorage.setItem(TOKEN_KEY, response.token))
    );
  }

  getAccount(): Observable<{ username: string }> {
    return this.get<{ username: string }>(API_ENDPOINTS.auth.account);
  }

  updateAccount(changes: {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
  }): Observable<{ username: string }> {
    return this.put<{ username: string }>(API_ENDPOINTS.auth.account, changes);
  }

  isAuthenticated(): boolean {
    const token = getStoredToken();

    if (!token) {
      return false;
    }

    const payload = this.decodeTokenPayload(token);

    if (!payload?.exp) {
      return true;
    }

    return payload.exp * 1000 > Date.now();
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  private decodeTokenPayload(token: string): { exp?: number } | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }
}
