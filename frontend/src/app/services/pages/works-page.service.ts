import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AbstractRequestService } from '../api/abstract-request.service';

import { WorkListItem } from '../../interfaces/pages/WorksPage';

@Injectable({
  providedIn: 'root',
})
export class WorksPageService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getWorks(): Observable<WorkListItem[]> {
    return this.get<WorkListItem[]>(
      'api/pages/works'
    );
  }
}