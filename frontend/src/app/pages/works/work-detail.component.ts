import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WorkService } from '../../services/api/work.service';
import { PhotoService } from '../../services/api/photo.service';
import { Work } from '../../interfaces/Work';
import { Photo, extractYearFromPhotoDate } from '../../interfaces/Photo';
import { Router } from '@angular/router';
import { LanguageService } from '../../core/language.service';


@Component({
  selector: 'app-work-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './work-detail.component.html',
  styleUrl: './work-detail.component.scss',
})
export class WorkDetailComponent implements OnInit {
  currentLang = 'en';

  work: Work | null = null;
  photos: Photo[] = [];
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workService: WorkService,
    private photoService: PhotoService,
      public languageService: LanguageService
  ) {}

  ngOnInit(): void {

    const lang = this.router.url.split('/')[1];

    if (lang === 'fr' || lang === 'en') {
      this.currentLang = lang;
    }

    const workId = this.route.snapshot.paramMap.get('id');
    if (!workId) {
      this.error = 'Work introuvable.';
      return;
    }

    this.workService.getWork(workId).subscribe({
      next: (work) => (this.work = work),
      error: () => (this.error = 'Work introuvable.'),
    });

    this.photoService.getPhotosByWorkId(workId).subscribe({
      next: (photos) => (this.photos = photos),
      error: () => (this.error = 'Erreur lors du chargement des photos.'),
    });
  }

  displayLabel(photo: Photo): string {
    return `${extractYearFromPhotoDate(photo.photoDate)} - ${photo.title}`;
  }
}
