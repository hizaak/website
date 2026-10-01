import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { WorksPageService } from '../../services/pages/works.service';
import { WorkListItem } from '../../interfaces/pages/WorksPage';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-works',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './works.component.html',
})
export class WorksComponent implements OnInit {
  // null until loaded.
  works: WorkListItem[] | null = null;
  // Translation key.
  error: string | null = null;

  constructor(
    private worksPageService: WorksPageService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.worksPageService.getWorks().subscribe({
      next: (works) => (this.works = works),
      error: () => (this.error = 'works.loadError'),
    });
  }
}
