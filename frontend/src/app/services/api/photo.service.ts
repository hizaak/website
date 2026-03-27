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

  getPhoto(id: string): Observable<Photo> {
    return this.get<Photo>(`photos/${id}`);
  }

  getAllPhotos(): Observable<Photo[]> {
    return this.get<Photo[]>('photos');
  }

  getRandomPhoto(): Observable<Photo> {
    return this.get<Photo>('photos/random');
  }

  createPhoto(
    photo: Omit<Photo, '_id' | 'createdAt' | 'updatedAt'>
  ): Observable<Photo> {
    return this.post<Photo>('photos', photo);
  }

  updatePhoto(
    id: string,
    photo: Partial<Omit<Photo, '_id' | 'createdAt' | 'updatedAt'>>
  ): Observable<Photo> {
    return this.put<Photo>(`photos/${id}`, photo);
  }

  deletePhoto(id: string): Observable<any> {
    return this.delete<any>(`photos/${id}`);
  }
}
