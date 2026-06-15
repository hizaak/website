import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractRequestService } from './abstract-request.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Photo } from '../../interfaces/Photo';

@Injectable({
  providedIn: 'root',
})
export class PhotoService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getPhotosByWorkId(workId: string): Observable<Photo[]> {
    return this.get<Photo[]>(`api/works/${workId}/photos`);
  }

  getPhoto(id: string): Observable<Photo> {
    return this.get<Photo>(`api/photos/${id}`);
  }

  createPhoto(workId: string, formData: FormData): Observable<Photo> {
    return this.http.post<Photo>(
      `${this.apiUrl}/api/works/${workId}/photos`,
      formData
    );
  }

  updatePhoto(id: string, formData: FormData): Observable<Photo> {
    return this.http.put<Photo>(`${this.apiUrl}/api/photos/${id}`, formData);
  }

  deletePhoto(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`api/photos/${id}`);
  }

  getPhotoUrl(filename: string): string {
    return `${environment.apiUrl}/uploads/${filename}`;
  }
}
