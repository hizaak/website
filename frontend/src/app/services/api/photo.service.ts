import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractRequestService } from './abstract-request.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Photo, PhotoSize } from '../../interfaces/Photo';
import { API_ENDPOINTS } from '../../core/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class PhotoService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getPhotosByWorkId(workId: string): Observable<Photo[]> {
    return this.get<Photo[]>(API_ENDPOINTS.works.photos(workId));
  }

  createPhoto(workId: string, formData: FormData): Observable<Photo> {
    return this.post<Photo>(API_ENDPOINTS.works.photos(workId), formData);
  }

  updatePhoto(id: string, formData: FormData): Observable<Photo> {
    return this.put<Photo>(API_ENDPOINTS.photos.byId(id), formData);
  }

  deletePhoto(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(API_ENDPOINTS.photos.byId(id));
  }

  reorderPhotos(workId: string, photoIds: string[]): Observable<Photo[]> {
    return this.put<Photo[]>(
      API_ENDPOINTS.works.reorderPhotos(workId),
      { photoIds }
    );
  }

  getPhotoUrl(filename: string): string {
    return `${environment.apiUrl}/uploads/${filename}`;
  }

  getPhotoSizeUrl(filename: string, size: number): string {
    return `${environment.apiUrl}/uploads/sizes/${size}/${filename}`;
  }

  // Every version of the photo with its width, for <img srcset>. Empty when
  // the sizes or dimensions are unknown: the browser then uses src alone.
  getPhotoSrcset(photo: { filename: string; width?: number; sizes?: PhotoSize[] }): string {
    if (!photo.width || !photo.sizes) {
      return '';
    }

    return [
      ...photo.sizes.map((size) => `${this.getPhotoSizeUrl(photo.filename, size.size)} ${size.width}w`),
      `${this.getPhotoUrl(photo.filename)} ${photo.width}w`,
    ].join(', ');
  }

  getPhotoThumbnailUrl(photo: Photo): string {
    if (photo.thumbnailFilename) {
      return `${environment.apiUrl}/uploads/thumbnails/${photo.thumbnailFilename}`;
    }

    return this.getPhotoUrl(photo.filename);
  }
}
