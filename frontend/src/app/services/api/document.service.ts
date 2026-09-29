import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbstractRequestService } from './abstract-request.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentFile } from '../../interfaces/DocumentFile';
import { API_ENDPOINTS } from '../../core/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class DocumentService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getAllDocuments(): Observable<DocumentFile[]> {
    return this.get<DocumentFile[]>(API_ENDPOINTS.documents.base);
  }

  createDocument(formData: FormData): Observable<DocumentFile> {
    return this.post<DocumentFile>(API_ENDPOINTS.documents.base, formData);
  }

  renameDocument(filename: string, name: string): Observable<DocumentFile> {
    return this.put<DocumentFile>(API_ENDPOINTS.documents.byFilename(filename), { name });
  }

  deleteDocument(filename: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(API_ENDPOINTS.documents.byFilename(filename));
  }

  getDocumentUrl(document: DocumentFile): string {
    return `${environment.documentsUrl}/${document.slug}`;
  }
}
