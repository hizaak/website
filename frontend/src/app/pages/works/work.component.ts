import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Photo } from '../../interfaces/Photo';
import { PhotoService } from '../../services/api/photo.service';

import {
  ActivatedRoute,
  Router,
  RouterModule,
} from '@angular/router';

import { WorkPageService } from '../../services/pages/work.service';

import {
  WorkPage,
  WorkPagePhoto,
} from '../../interfaces/pages/WorkPage';

import { LanguageService } from '../../core/language.service';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-work',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './work.component.html',
  styleUrl: './work.component.scss',
})
export class WorkComponent implements OnInit {
  work: WorkPage | null = null;
  selectedPhoto: Photo | null = null;

  error: string | null = null;

  currentPhotoIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workPageService: WorkPageService,
    private photoService: PhotoService,
    public languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const workId = params.get('id');

      if (!workId) {
        this.error = 'Work introuvable.';
        return;
      }

      const rawPhotoIndex = params.get('photoIndex');
      const hasPhotoIndexParam = rawPhotoIndex !== null;

      // URL exposes a 1-based photo number; convert to a 0-based array index internally.
      const photoIndex = hasPhotoIndexParam
        ? Number(rawPhotoIndex) - 1
        : 0;

      this.loadWork(workId, photoIndex, hasPhotoIndexParam);
    });
  }

  private loadWork(
    workId: string,
    photoIndex: number,
    hasPhotoIndexParam: boolean
  ): void {
    this.workPageService.getWork(workId).subscribe({
      next: (work) => {
        this.work = work;

        if (!work.photos.length) {
          this.error = 'Aucune photo disponible.';
          return;
        }

        if (
          !hasPhotoIndexParam ||
          Number.isNaN(photoIndex) ||
          photoIndex < 0 ||
          photoIndex >= work.photos.length
        ) {
          this.navigateToPhoto(0, true);
          return;
        }

        this.currentPhotoIndex = photoIndex;

        const photoId =
          work.photos[photoIndex]._id;

        this.loadPhoto(photoId);

        this.error = null;

      },
      error: () => {
        this.error = 'Work introuvable.';
      },
    });
  }

  private loadPhoto(
    photoId: string
  ): void {
    this.photoService
      .getPhoto(photoId)
      .subscribe({
        next: (photo) => {
          this.selectedPhoto = photo;
        },
        error: () => {
          this.error =
            'Photo introuvable.';
        },
      });
  }


  selectPhoto(index: number): void {
    if (!this.work) {
      return;
    }

    this.navigateToPhoto(index);
  }

  private navigateToPhoto(
    photoIndex: number,
    replaceUrl = false
  ): void {
    if (!this.work) {
      return;
    }

    // Photo index is 0-based internally but 1-based in the URL.
    this.router.navigate([
      '/',
      this.languageService.currentLang,
      'works',
      this.work.slug,
      photoIndex + 1,
    ], { replaceUrl });
  }

  get hasPreviousPhoto(): boolean {
    return this.currentPhotoIndex > 0;
  }

  get hasNextPhoto(): boolean {
    return (
      !!this.work &&
      this.currentPhotoIndex <
      this.work.photos.length - 1
    );
  }

  previousPhoto(): void {
    if (this.hasPreviousPhoto) {
      this.navigateToPhoto(
        this.currentPhotoIndex - 1
      );
    }
  }

  nextPhoto(): void {
    if (this.hasNextPhoto) {
      this.navigateToPhoto(
        this.currentPhotoIndex + 1
      );
    }
  }

  get photoUrl(): string | null {
    if (!this.selectedPhoto) {
      return null;
    }

    return this.photoService.getPhotoUrl(
      this.selectedPhoto.filename
    );
  }

  get currentPhotoInfo():
    | WorkPagePhoto
    | null {
    if (
      !this.work ||
      !this.work.photos.length
    ) {
      return null;
    }

    return this.work.photos[
      this.currentPhotoIndex
    ];
  }
}
