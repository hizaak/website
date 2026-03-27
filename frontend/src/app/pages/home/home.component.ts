import { Component, OnInit } from '@angular/core';
import { PhotoService } from '../../services/api/photo.service';
import { CommonModule } from '@angular/common';
import { Photo } from '../../interfaces/Photo';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  photo: Photo | null = null;
  error: string | null = null;

  constructor(private photoService: PhotoService) {}

  ngOnInit() {
    this.fetchPhotos();
  }

  fetchPhotos() {
    this.photoService.getRandomPhoto().subscribe({
      next: (data) => (this.photo = data),
      error: (err) => {
        this.error = 'Erreur lors de la récupération des photos.';
        console.error(err);
      },
    });
  }
}
