import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WorkService } from '../../../../services/api/work.service';
import { PhotoService } from '../../../../services/api/photo.service';
import { Work } from '../../../../interfaces/Work';
import { Photo, isAllowedImageFile } from '../../../../interfaces/Photo';

@Component({
  selector: 'app-admin-work-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './work-detail-admin.component.html',
  styleUrl: './work-detail-admin.component.scss',
})
export class WorkDetailAdminComponent implements OnInit {
  work: Work | null = null;
  photos: Photo[] = [];
  editTitle = '';
  error: string | null = null;

  newPhotoTitle = '';
  newPhotoDate = '';
  newPhotoFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workService: WorkService,
    private photoService: PhotoService
  ) { }

  ngOnInit(): void {
    const workId = this.route.snapshot.paramMap.get('workId');
    if (!workId) {
      this.error = 'Work introuvable.';
      return;
    }

    this.loadWork(workId);
    this.loadPhotos(workId);
  }

  loadWork(workId: string): void {
    this.workService.getWork(workId).subscribe({
      next: (work) => {
        this.work = work;
        this.editTitle = work.title;
      },
      error: () => (this.error = 'Work introuvable.'),
    });
  }

  loadPhotos(workId: string): void {
    this.photoService.getPhotosByWorkId(workId).subscribe({
      next: (photos) => (this.photos = photos),
      error: () => (this.error = 'Erreur lors du chargement des photos.'),
    });
  }

  updateWork(): void {
    if (!this.work || !this.editTitle.trim()) {
      return;
    }

    this.workService.updateWork(this.work._id, this.editTitle.trim()).subscribe({
      next: (work) => {
        this.work = work;
        this.error = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la modification.';
      },
    });
  }

  onNewPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!isAllowedImageFile(file)) {
      this.error = 'Format non autorisé. Seuls PNG et JPEG sont acceptés.';
      input.value = '';
      this.newPhotoFile = null;
      return;
    }

    this.error = null;
    this.newPhotoFile = file;
  }

  createPhoto(): void {
    if (!this.work || !this.newPhotoTitle.trim() || !this.newPhotoDate.trim() || !this.newPhotoFile) {
      this.error = 'Tous les champs sont requis pour créer une photo.';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newPhotoTitle.trim());
    formData.append('photoDate', this.newPhotoDate.trim());
    formData.append('photo', this.newPhotoFile);

    this.photoService.createPhoto(this.work._id, formData).subscribe({
      next: () => {
        this.newPhotoTitle = '';
        this.newPhotoDate = '';
        this.newPhotoFile = null;
        this.error = null;
        this.loadPhotos(this.work!._id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création de la photo.';
      },
    });
  }

  openPhoto(photo: Photo): void {
    this.router.navigate([
      '/en/admin/works',
      this.work!._id,
      'photos',
      photo._id
    ]);
  }

  deletePhoto(photo: Photo): void {
    if (!confirm(`Supprimer la photo "${photo.title}" ?`)) {
      return;
    }

    this.photoService.deletePhoto(photo._id).subscribe({
      next: () => this.loadPhotos(this.work!._id),
      error: () => (this.error = 'Erreur lors de la suppression.'),
    });
  }

  backToList(): void {
    this.router.navigate(['/en/admin/works']);
  }
}
