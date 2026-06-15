import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractRequestService } from './abstract-request.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Work } from '../../interfaces/Work';

@Injectable({
  providedIn: 'root',
})
export class WorkService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getAllWorks(): Observable<Work[]> {
    return this.get<Work[]>('api/works');
  }

  getWork(id: string): Observable<Work> {
    return this.get<Work>(`api/works/${id}`);
  }

  createWork(title: string): Observable<Work> {
    return this.post<Work>('api/works', { title });
  }

  updateWork(id: string, title: string): Observable<Work> {
    return this.put<Work>(`api/works/${id}`, { title });
  }

  deleteWork(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`api/works/${id}`);
  }
}
