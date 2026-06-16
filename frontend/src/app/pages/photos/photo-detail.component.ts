import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { PhotoService } from '../../services/api/photo.service';
import { Photo, extractYearFromPhotoDate } from '../../interfaces/Photo';
import { Router } from '@angular/router';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-photo-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
})
export class PhotoDetailComponent implements OnInit {
  currentLang = 'en';

  photo: Photo | null = null;
  photoUrl: string | null = null;
  error: string | null = null;

  previousPhoto: Photo | null = null;
  nextPhoto: Photo | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService,
    public languageService: LanguageService
  ) {}

  get photoYear(): string {
    if (!this.photo) {
      return '';
    }

    return extractYearFromPhotoDate(this.photo.photoDate);
  }

  ngOnInit(): void {

    const lang = this.router.url.split('/')[1];

    if (lang === 'fr' || lang === 'en') {
      this.currentLang = lang;
    }

    const photoId = this.route.snapshot.paramMap.get('id');

    if (!photoId) {
      this.error = 'Photo introuvable.';
      return;
    }

    this.photoService.getPhoto(photoId).subscribe({
      next: (photo) => {
        this.photo = photo;
        this.photoUrl = this.photoService.getPhotoUrl(photo.filename);

        this.photoService.getPhotosByWorkId(photo.workId).subscribe({
          next: (photos) => {
            const index = photos.findIndex(
              (p) => p._id === photo._id
            );

            this.previousPhoto =
              index > 0 ? photos[index - 1] : null;

            this.nextPhoto =
              index < photos.length - 1
                ? photos[index + 1]
                : null;
          },
          error: () => {
            console.error(
              'Impossible de charger les photos du work'
            );
          },
        });
      },
      error: () => {
        this.error = 'Photo introuvable.';
      },
    });
  }
}