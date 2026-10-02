import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { NavigationSkipped, NavigationSkippedCode, Router } from '@angular/router';
import { filter } from 'rxjs';

import { PhotoService } from '../../services/api/photo.service';
import { HomePageService } from '../../services/pages/home.service';
import { WorkPagePhoto } from '../../interfaces/pages/WorkPage';
import { LanguageService } from '../../core/language.service';
import { DATE_FORMATS, PHOTO_SIZES_ATTRIBUTE } from '../works/photo-display';

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-home',
  imports: [DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  readonly sizes = PHOTO_SIZES_ATTRIBUTE;

  // null until loaded, and when the site has no photo or it failed to load:
  // the page then simply stays empty.
  photo: WorkPagePhoto | null = null;

  constructor(
    private homePageService: HomePageService,
    private router: Router,
    public photoService: PhotoService,
    public languageService: LanguageService
  ) {}

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);

  get dateFormat(): string {
    return DATE_FORMATS[this.languageService.currentLang as 'fr' | 'en'];
  }

  ngOnInit(): void {
    // The page is pre-rendered at build time without the photo, which is
    // drawn at random at every visit.
    if (!this.isBrowser) {
      return;
    }

    this.loadPhoto();

    // Clicking the site name while already here: the router stays put, but
    // another photo is drawn.
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationSkipped =>
            event instanceof NavigationSkipped &&
            event.code === NavigationSkippedCode.IgnoredSameUrlNavigation
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadPhoto());
  }

  private loadPhoto(): void {
    this.homePageService.getPhoto(this.photo?._id).subscribe({
      next: (photo) => (this.photo = photo),
      error: () => (this.photo = null),
    });
  }
}
