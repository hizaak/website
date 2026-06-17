import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AbstractRequestService } from '../api/abstract-request.service';

import { WorkPage } from '../../interfaces/pages/WorkPage';

@Injectable({
  providedIn: 'root',
})
export class WorkPageService extends AbstractRequestService {
  constructor(http: HttpClient) {
    super(http, environment.apiUrl);
  }

  getWork(id: string): Observable<WorkPage> {
    return this.get<WorkPage>(
      `api/pages/work/${id}`
    );
  }
}