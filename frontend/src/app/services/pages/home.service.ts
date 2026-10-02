import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AbstractRequestService } from '../api/abstract-request.service';

import { WorkPagePhoto } from '../../interfaces/pages/WorkPage';
import { API_ENDPOINTS } from '../../core/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class HomePageService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  // A photo drawn at random, other than the one already shown, or null when
  // the site has none.
  getPhoto(shownId?: string): Observable<WorkPagePhoto | null> {
    return this.get<WorkPagePhoto | null>(
      shownId
        ? `${API_ENDPOINTS.pages.home}?not=${encodeURIComponent(shownId)}`
        : API_ENDPOINTS.pages.home
    );
  }
}
