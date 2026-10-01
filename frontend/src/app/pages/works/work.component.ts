import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { PhotoService } from '../../services/api/photo.service';
import { WorkPageService } from '../../services/pages/work.service';
import { WorkPage, WorkPagePhoto } from '../../interfaces/pages/WorkPage';
import { LanguageService } from '../../core/language.service';
import { SeoService } from '../../core/seo.service';
import { NotFoundComponent } from '../not-found/not-found.component';

// Must match the max-width of .photo in work.component.scss, so that the
// browser picks the right version from the srcset.
export const PHOTO_SIZES_ATTRIBUTE = '(max-width: 768px) 100vw, calc(100vw - 100px)';

// French readers expect 14/08/2023; for anyone else that order is ambiguous
// (08/14 in the US), so English spells the month out: 14 Aug 2023.
const DATE_FORMATS: Record<'fr' | 'en', string> = {
  fr: 'dd/MM/yyyy',
  en: 'd MMM yyyy',
};

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-work',
  imports: [DatePipe, RouterLink, TranslatePipe, NotFoundComponent],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
})
export class WorkComponent implements OnInit {
  readonly sizes = PHOTO_SIZES_ATTRIBUTE;

  work: WorkPage | null = null;
  currentPhotoIndex = 0;

  // Translation key.
  error: string | null = null;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workPageService: WorkPageService,
    public photoService: PhotoService,
    public languageService: LanguageService,
    private seoService: SeoService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('id') ?? '';
      const rawPhotoIndex = params.get('photoIndex');

      // The URL holds a 1-based photo number; NaN when absent or invalid.
      const photoIndex = rawPhotoIndex === null ? NaN : Number(rawPhotoIndex) - 1;

      // Moving between photos of the same work reuses the loaded work.
      if (this.work?.slug === slug) {
        this.showPhoto(photoIndex);
      } else {
        this.loadWork(slug, photoIndex);
      }
    });
  }

  get photo(): WorkPagePhoto | null {
    return this.work?.photos[this.currentPhotoIndex] ?? null;
  }

  // The photo shown by clicking the current one: the next, or the first
  // after the last.
  get nextPhotoIndex(): number {
    return this.work ? (this.currentPhotoIndex + 1) % this.work.photos.length : 0;
  }

  get dateFormat(): string {
    return DATE_FORMATS[this.lang];
  }

  photoLink(photoIndex: number): (string | number)[] {
    // Photo numbers are 1-based in the URL.
    return ['/', this.languageService.currentLang, 'works', this.work!.slug, photoIndex + 1];
  }

  // ← and → move between photos, unless a field has the focus.
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
      target?.closest('input, textarea, select, [contenteditable]')
    ) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      this.goToPhoto(this.currentPhotoIndex - 1);
    } else if (event.key === 'ArrowRight') {
      this.goToPhoto(this.currentPhotoIndex + 1);
    }
  }

  private loadWork(slug: string, photoIndex: number): void {
    this.workPageService.getWork(slug).subscribe({
      next: (work) => {
        this.work = work;
        this.notFound = false;
        this.showPhoto(photoIndex);
      },
      error: (err) => {
        this.work = null;

        if (err?.status === 404) {
          this.notFound = true;
          this.seoService.setNotFound(this.lang);
        } else {
          this.error = 'work.loadError';
        }
      },
    });
  }

  private showPhoto(photoIndex: number): void {
    if (!this.work) {
      return;
    }

    if (!this.work.photos.length) {
      this.error = 'work.noPhotos';
      return;
    }

    // Out of range or missing number: show the first photo under its URL.
    if (!(photoIndex >= 0 && photoIndex < this.work.photos.length)) {
      this.navigateToPhoto(0, true);
      return;
    }

    this.error = null;
    this.currentPhotoIndex = photoIndex;

    const photo = this.work.photos[photoIndex];
    this.seoService.setWorkPage(this.lang, this.work.title, this.previewImageUrl(photo));

    this.preload(this.work.photos[photoIndex + 1]);
    this.preload(this.work.photos[photoIndex - 1]);
  }

  private goToPhoto(photoIndex: number): void {
    if (this.work && photoIndex >= 0 && photoIndex < this.work.photos.length) {
      this.navigateToPhoto(photoIndex);
    }
  }

  private navigateToPhoto(photoIndex: number, replaceUrl = false): void {
    this.router.navigate(this.photoLink(photoIndex), { replaceUrl });
  }

  // Loads the version of a neighbouring photo the browser would pick, so
  // that moving to it shows it at once.
  private preload(photo: WorkPagePhoto | undefined): void {
    if (!photo) {
      return;
    }

    const image = new Image();
    image.sizes = this.sizes;
    image.srcset = this.photoService.getPhotoSrcset(photo);
    image.src = this.photoService.getPhotoUrl(photo.filename);
  }

  // Link previews only need a small image.
  private previewImageUrl(photo: WorkPagePhoto): string {
    const [smallest] = photo.sizes ?? [];
    return smallest
      ? this.photoService.getPhotoSizeUrl(photo.filename, smallest.size)
      : this.photoService.getPhotoUrl(photo.filename);
  }

  private get lang(): 'fr' | 'en' {
    return this.languageService.currentLang as 'fr' | 'en';
  }
}
