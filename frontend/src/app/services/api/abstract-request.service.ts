import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Base of the API services: prefixes the API URL and logs failed requests.
export abstract class AbstractRequestService {
  constructor(protected http: HttpClient, protected apiUrl: string) { }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`).pipe(catchError(this.logError));
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body).pipe(catchError(this.logError));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body).pipe(catchError(this.logError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`).pipe(catchError(this.logError));
  }

  private logError(error: unknown): Observable<never> {
    console.error('Error:', error);
    return throwError(() => error);
  }
}
