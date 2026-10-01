import { ChangeDetectionStrategy, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { WorksPageService } from '../../services/pages/works.service';
import { WorkListItem } from '../../interfaces/pages/WorksPage';
import { LanguageService } from '../../core/language.service';

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-works',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './works.component.html',
  styleUrl: './works.component.scss',
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

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit(): void {
    // The page is pre-rendered at build time without the list, which would
    // otherwise stay as it was on the day of the deploy.
    if (!this.isBrowser) {
      return;
    }

    this.worksPageService.getWorks().subscribe({
      next: (works) => (this.works = works),
      error: () => (this.error = 'works.loadError'),
    });
  }
}
