import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AbstractRequestService } from '../services/api/abstract-request.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  login(username: string, password: string): Observable<any> {
    return this.post<any>('login', { username, password }).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('jwt', response.token);
        }
      })
    );
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt');
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('jwt');
  }
}
