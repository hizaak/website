import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PhotoService } from '../../services/api/photo.service';
import { Photo } from '../../interfaces/Photo';

@Component({
  selector: 'app-photo-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-detail.component.html',
  styleUrl: './photo-detail.component.scss',
})
export class PhotoDetailComponent implements OnInit {
  photo: Photo | null = null;
  photoUrl: string | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private photoService: PhotoService
  ) {}

  ngOnInit(): void {
    const photoId = this.route.snapshot.paramMap.get('id');
    if (!photoId) {
      this.error = 'Photo introuvable.';
      return;
    }

    this.photoService.getPhoto(photoId).subscribe({
      next: (photo) => {
        this.photo = photo;
        this.photoUrl = this.photoService.getPhotoUrl(photo.filename);
      },
      error: () => (this.error = 'Photo introuvable.'),
    });
  }
}
