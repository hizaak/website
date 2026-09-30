import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AbstractRequestService } from './abstract-request.service';
import { API_ENDPOINTS } from '../../core/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  login(username: string, password: string): Observable<any> {
    return this.post<any>(API_ENDPOINTS.auth.login, { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('jwt', response.token);
        }
      })
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
    const token = localStorage.getItem('jwt');

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
    localStorage.removeItem('jwt');
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
