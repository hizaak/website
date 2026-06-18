import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractRequestService } from './abstract-request.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Work } from '../../interfaces/Work';
import { API_ENDPOINTS } from '../../core/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class WorkService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getAllWorks(): Observable<Work[]> {
    return this.get<Work[]>(API_ENDPOINTS.works.base);
  }

  getWork(id: string): Observable<Work> {
    return this.get<Work>(API_ENDPOINTS.works.byId(id));
  }

  createWork(title: string): Observable<Work> {
    return this.post<Work>(API_ENDPOINTS.works.base, { title });
  }

  updateWork(id: string, title: string): Observable<Work> {
    return this.put<Work>(API_ENDPOINTS.works.byId(id), { title });
  }

  deleteWork(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(API_ENDPOINTS.works.byId(id));
  }
}
