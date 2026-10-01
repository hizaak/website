import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WorkService } from '../../../services/api/work.service';
import { PhotoService } from '../../../services/api/photo.service';
import { AdminNavigationService } from '../../../core/admin-navigation.service';
import { Work } from '../../../interfaces/Work';
import { Photo, isAllowedImageFile, toDateInputValue } from '../../../interfaces/Photo';

// Translation key for each error code of the photo upload API.
const UPLOAD_ERROR_KEYS: Record<string, string> = {
  IMAGE_FORMAT_UNSUPPORTED: 'admin.photoErrors.format',
  IMAGE_UNREADABLE: 'admin.photoErrors.unreadable',
  IMAGE_TOO_LARGE: 'admin.photoErrors.tooLarge',
};

@Component({
  selector: 'app-admin-work-detail',
  imports: [DatePipe, FormsModule, TranslatePipe],
  templateUrl: './work-detail-admin.component.html',
  styleUrl: './work-detail-admin.component.scss',
})
export class WorkDetailAdminComponent implements OnInit, OnDestroy {
  @ViewChild('newPhotoInput') newPhotoInput?: ElementRef<HTMLInputElement>;

  work: Work | null = null;
  photos: Photo[] = [];
  editTitle = '';
  // Translation key.
  error: string | null = null;
  saving = false;

  newPhotoTitle = '';
  // "YYYY-MM-DD", the value of <input type="date">.
  newPhotoDate = '';
  newPhotoFile: File | null = null;
  newPhotoPreviewUrl: string | null = null;

  selectedPhoto: Photo | null = null;
  editPhotoTitle = '';
  editPhotoDate = '';
  replacePhotoFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private workService: WorkService,
    public photoService: PhotoService,
    private adminNavigation: AdminNavigationService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    const workId = this.route.snapshot.paramMap.get('workId');
    if (!workId) {
      this.error = 'admin.workErrors.notFound';
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
      error: () => (this.error = 'admin.workErrors.notFound'),
    });
  }

  loadPhotos(workId: string): void {
    this.photoService.getPhotosByWorkId(workId).subscribe({
      next: (photos) => (this.photos = photos),
      error: () => (this.error = 'admin.photoErrors.load'),
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
      error: (err) =>
        (this.error = err?.status === 409 ? 'admin.workErrors.titleTaken' : 'admin.workErrors.update'),
    });
  }

  deleteWork(): void {
    if (!this.work || !confirm(this.translate.instant('admin.confirmDeleteWork', { title: this.work.title }))) {
      return;
    }

    this.workService.deleteWork(this.work._id).subscribe({
      next: () => this.adminNavigation.toWorks(),
      error: () => (this.error = 'admin.workErrors.delete'),
    });
  }

  onNewPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.revokeNewPhotoPreview();

    if (file && !isAllowedImageFile(file)) {
      this.error = 'admin.photoErrors.format';
      input.value = '';
      this.newPhotoFile = null;
      return;
    }

    this.error = null;
    this.newPhotoFile = file ?? null;
    this.newPhotoPreviewUrl = file ? URL.createObjectURL(file) : null;
  }

  private revokeNewPhotoPreview(): void {
    if (this.newPhotoPreviewUrl) {
      URL.revokeObjectURL(this.newPhotoPreviewUrl);
      this.newPhotoPreviewUrl = null;
    }
  }

  createPhoto(): void {
    if (!this.work || !this.newPhotoTitle.trim() || !this.newPhotoDate || !this.newPhotoFile) {
      this.error = 'admin.photoErrors.required';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.newPhotoTitle.trim());
    formData.append('photoDate', this.newPhotoDate);
    formData.append('photo', this.newPhotoFile);

    this.saving = true;

    this.photoService.createPhoto(this.work._id, formData).subscribe({
      next: () => {
        this.saving = false;
        this.newPhotoTitle = '';
        this.newPhotoDate = '';
        this.newPhotoFile = null;
        if (this.newPhotoInput) {
          this.newPhotoInput.nativeElement.value = '';
        }
        this.revokeNewPhotoPreview();
        this.error = null;
        this.loadPhotos(this.work!._id);
      },
      error: (err) => {
        this.saving = false;
        this.error = this.photoError(err, 'admin.photoErrors.create');
      },
    });
  }

  editPhoto(photo: Photo): void {
    this.selectedPhoto = photo;
    this.editPhotoTitle = photo.title;
    this.editPhotoDate = toDateInputValue(photo.photoDate);
    this.replacePhotoFile = null;
  }

  onReplaceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && !isAllowedImageFile(file)) {
      this.error = 'admin.photoErrors.format';
      input.value = '';
      this.replacePhotoFile = null;
      return;
    }

    this.error = null;
    this.replacePhotoFile = file ?? null;
  }

  updateSelectedPhoto(): void {
    if (!this.work || !this.selectedPhoto) {
      return;
    }

    if (!this.editPhotoTitle.trim() || !this.editPhotoDate) {
      this.error = 'admin.photoErrors.titleAndDate';
      return;
    }

    const formData = new FormData();
    formData.append('title', this.editPhotoTitle.trim());
    formData.append('photoDate', this.editPhotoDate);

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
      error: (err) => (this.error = this.photoError(err, 'admin.photoErrors.update')),
    });
  }

  movePhoto(fromIndex: number, toIndex: number): void {
    if (!this.work || toIndex < 0 || toIndex >= this.photos.length) {
      return;
    }

    const reorderedPhotos = [...this.photos];
    const [photo] = reorderedPhotos.splice(fromIndex, 1);
    reorderedPhotos.splice(toIndex, 0, photo);

    this.photos = reorderedPhotos;

    this.photoService
      .reorderPhotos(this.work._id, reorderedPhotos.map((item) => item._id))
      .subscribe({
        next: (photos) => {
          this.photos = photos;
          this.error = null;
        },
        error: () => {
          this.error = 'admin.photoErrors.reorder';
          this.loadPhotos(this.work!._id);
        },
      });
  }

  deletePhoto(photo: Photo): void {
    if (!confirm(this.translate.instant('admin.confirmDeletePhoto', { title: photo.title }))) {
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
      error: () => (this.error = 'admin.photoErrors.delete'),
    });
  }

  backToList(): void {
    this.adminNavigation.toWorks();
  }

  // Upload errors the API identifies by a code get their own message.
  private photoError(err: HttpErrorResponse, fallback: string): string {
    const code: string | undefined = err?.error?.code;
    return code && UPLOAD_ERROR_KEYS[code] ? UPLOAD_ERROR_KEYS[code] : fallback;
  }
}
