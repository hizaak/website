import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AbstractRequestService } from './abstract-request.service';
import { environment } from '../../../environments/environment';
import { Serie } from '../../interfaces/Serie';

@Injectable({
  providedIn: 'root',
})
export class SerieService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getSerie(id: string): Observable<Serie> {
    return this.get<Serie>(`series/${id}`);
  }

  getAllSeries(): Observable<Serie[]> {
    return this.get<Serie[]>('series');
  }

  createSerie(title: string, years: string): Observable<Serie> {
    const body = { title, years };
    return this.post<Serie>('series', body);
  }

  updateSerie(id: string, title: string, years: string): Observable<Serie> {
    const body = { title, years };
    return this.put<Serie>(`series/${id}`, body);
  }

  deleteSerie(id: string): Observable<any> {
    return this.delete<any>(`series/${id}`);
  }
}
