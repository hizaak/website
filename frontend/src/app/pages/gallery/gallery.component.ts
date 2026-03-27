import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/api/photo.service';
import { CommonModule } from '@angular/common';
import { Photo } from '../../interfaces/Photo';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',

  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit {
  photos: Photo[] = [];
  error: string | null = null;

  constructor(private photoService: PhotoService) {}

  ngOnInit() {
    this.fetchPhotos();
  }

  fetchPhotos() {
    this.photoService.getAllPhotos().subscribe({
      next: (data) => (this.photos = data),
      error: (err) => {
        this.error = 'Erreur lors de la récupération des photos.';
        console.error(err);
      },
    });
  }
}
