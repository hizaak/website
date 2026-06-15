import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PhotoService } from '../../../../services/api/photo.service';
import { Photo, isAllowedImageFile } from '../../../../interfaces/Photo';

@Component({
  selector: 'app-admin-photo-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './photo-detail-admin.component.html',
  styleUrl: './photo-detail-admin.component.scss',
})
export class PhotoDetailAdminComponent implements OnInit {
  photo: Photo | null = null;
  photoUrl: string | null = null;
  editTitle = '';
  editPhotoDate = '';
  replaceFile: File | null = null;
  error: string | null = null;
  workId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private photoService: PhotoService
  ) {}

  ngOnInit(): void {
    this.workId = this.route.snapshot.paramMap.get('workId');
    const photoId = this.route.snapshot.paramMap.get('photoId');
    if (!photoId) {
      this.error = 'Photo introuvable.';
      return;
    }

    this.photoService.getPhoto(photoId).subscribe({
      next: (photo) => {
        this.photo = photo;
        this.editTitle = photo.title;
        this.editPhotoDate = photo.photoDate;
        this.photoUrl = this.photoService.getPhotoUrl(photo.filename);
      },
      error: () => (this.error = 'Photo introuvable.'),
    });
  }

  onReplaceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!isAllowedImageFile(file)) {
      this.error = 'Format non autorisé. Seuls PNG et JPEG sont acceptés.';
      input.value = '';
      this.replaceFile = null;
      return;
    }

    this.error = null;
    this.replaceFile = file;
  }

  updatePhoto(): void {
    if (!this.photo) {
      return;
    }

    const formData = new FormData();
    formData.append('title', this.editTitle.trim());
    formData.append('photoDate', this.editPhotoDate.trim());
    if (this.replaceFile) {
      formData.append('photo', this.replaceFile);
    }

    this.photoService.updatePhoto(this.photo._id, formData).subscribe({
      next: (photo) => {
        this.photo = photo;
        this.photoUrl = this.photoService.getPhotoUrl(photo.filename);
        this.replaceFile = null;
        this.error = null;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la modification.';
      },
    });
  }

  backToWork(): void {
    if (this.workId) {
      this.router.navigate(['/dashboard/works', this.workId]);
    } else {
      this.router.navigate(['/dashboard/works']);
    }
  }
}
