import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { WorkService } from '../../../services/api/work.service';
import { PhotoService } from '../../../services/api/photo.service';
import { AdminNavigationService } from '../../../core/admin-navigation.service';
import { Work } from '../../../interfaces/Work';
import { Photo, isAllowedImageFile } from '../../../interfaces/Photo';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-work-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './work-detail-admin.component.html',
  styleUrl: './work-detail-admin.component.scss',
})
export class WorkDetailAdminComponent implements OnInit, OnDestroy {
  work: Work | null = null;
  photos: Photo[] = [];
  editTitle = '';
  error: string | null = null;

  newPhotoTitle = '';
  newPhotoDate = '';
  newPhotoFile: File | null = null;
  newPhotoPreviewUrl: string | null = null;
  selectedPhoto: Photo | null = null;
  replacePhotoFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private workService: WorkService,
    public photoService: PhotoService,
    private adminNavigation: AdminNavigationService
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

  ngOnDestroy(): void {
    this.revokeNewPhotoPreview();
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

  deleteWork(): void {
    if (!this.work) {
      return;
    }

    if (!confirm('Supprimer ce work ?')) {
      return;
    }

    this.workService.deleteWork(this.work._id).subscribe({
      next: () => {
        this.adminNavigation.toWorks();
      },
      error: () => (this.error = 'Erreur lors de la suppression.'),
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
      this.revokeNewPhotoPreview();
      return;
    }

    this.error = null;
    this.newPhotoFile = file;
    this.revokeNewPhotoPreview();
    this.newPhotoPreviewUrl = URL.createObjectURL(file);
  }

  private revokeNewPhotoPreview(): void {
    if (this.newPhotoPreviewUrl) {
      URL.revokeObjectURL(this.newPhotoPreviewUrl);
      this.newPhotoPreviewUrl = null;
    }
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
        this.revokeNewPhotoPreview();
        this.error = null;
        this.loadPhotos(this.work!._id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création de la photo.';
      },
    });
  }

  editPhoto(photo: Photo): void {
    this.selectedPhoto = {
      ...photo
    };
    this.replacePhotoFile = null;
  }

  onReplaceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!isAllowedImageFile(file)) {
      this.error = 'Format non autorise. Seuls PNG et JPEG sont acceptes.';
      input.value = '';
      this.replacePhotoFile = null;
      return;
    }

    this.error = null;
    this.replacePhotoFile = file;
  }

  updateSelectedPhoto(): void {
    if (!this.work || !this.selectedPhoto) {
      return;
    }

    if (!this.selectedPhoto.title.trim() || !this.selectedPhoto.photoDate.trim()) {
      this.error = 'Le titre et la date sont requis.';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.selectedPhoto.title.trim());
    formData.append('photoDate', this.selectedPhoto.photoDate.trim());

    if (this.replacePhotoFile) {
      formData.append('photo', this.replacePhotoFile);
    }

    this.photoService.updatePhoto(this.selectedPhoto._id, formData).subscribe({
      next: () => {
        this.selectedPhoto = null;
        this.replacePhotoFile = null;
        this.error = null;
        this.loadPhotos(this.work!._id);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la modification de la photo.';
      },
    });
  }

  movePhotoUp(index: number): void {
    this.movePhoto(index, index - 1);
  }

  movePhotoDown(index: number): void {
    this.movePhoto(index, index + 1);
  }

  private movePhoto(fromIndex: number, toIndex: number): void {
    if (
      !this.work ||
      toIndex < 0 ||
      toIndex >= this.photos.length
    ) {
      return;
    }

    const reorderedPhotos = [...this.photos];
    const [photo] = reorderedPhotos.splice(fromIndex, 1);
    reorderedPhotos.splice(toIndex, 0, photo);

    this.photos = reorderedPhotos;

    this.photoService
      .reorderPhotos(
        this.work._id,
        reorderedPhotos.map((item) => item._id)
      )
      .subscribe({
        next: (photos) => {
          this.photos = photos;
          this.error = null;
        },
        error: () => {
          this.error = 'Erreur lors du changement d ordre.';
          this.loadPhotos(this.work!._id);
        },
      });
  }

  deletePhoto(photo: Photo): void {
    if (!confirm(`Supprimer la photo "${photo.title}" ?`)) {
      return;
    }

    this.photoService.deletePhoto(photo._id).subscribe({
      next: () => {
        if (this.selectedPhoto?._id === photo._id) {
          this.selectedPhoto = null;
          this.replacePhotoFile = null;
        }
        this.loadPhotos(this.work!._id);
      },
      error: () => (this.error = 'Erreur lors de la suppression.'),
    });
  }

  backToList(): void {
    this.adminNavigation.toWorks();
  }
}
