import { Component, OnInit } from '@angular/core';
import { SerieService } from '../../../../services/api/serie.service';
import { PhotoService } from '../../../../services/api/photo.service';
import { Photo } from '../../../../interfaces/Photo';
import { Serie } from '../../../../interfaces/Serie';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-series',
  imports: [CommonModule, FormsModule],
  templateUrl: './series.component.html',
  styleUrl: './series.component.scss',
})
export class SeriesComponent implements OnInit {
  series: Serie[] = [];
  private serieUpdateSubject = new Subject<{ serie: Serie; index: number }>();
  private photoUpdateSubject = new Subject<{
    photo: Photo;
    serieIndex: number;
    photoIndex: number;
  }>();

  constructor(
    private serieService: SerieService,
    private photoService: PhotoService
  ) {}

  ngOnInit() {
    this.loadSeries();

    // Séries : attendre 500ms avant d'envoyer la mise à jour
    this.serieUpdateSubject
      .pipe(debounceTime(500))
      .subscribe(({ serie, index }) => {
        this.serieService
          .updateSerie(serie._id, serie.title, serie.years.toString())
          .subscribe({
            next: (updatedSerie) => {
              this.series[index] = updatedSerie; // Mise à jour locale
            },
            error: (error) =>
              console.error('Erreur lors de la mise à jour de la série', error),
          });
      });

    // Photos : attendre 500ms avant d'envoyer la mise à jour
    this.photoUpdateSubject
      .pipe(debounceTime(500))
      .subscribe(({ photo, serieIndex, photoIndex }) => {
        this.photoService
          .updatePhoto(photo._id, {
            title: photo.title,
            path: photo.path,
            date: photo.date,
            size: photo.size,
            serie: photo.serie,
          })
          .subscribe({
            next: (updatedPhoto) => {
              this.series[serieIndex].photos[photoIndex] = updatedPhoto;
            },
            error: (error) =>
              console.error('Erreur lors de la mise à jour de la photo', error),
          });
      });
  }

  loadSeries() {
    this.serieService.getAllSeries().subscribe((series) => {
      this.series = series;
    });
  }

  addSerie() {
    const newSerie = {
      name: '',
      year: new Date().getFullYear(),
      photos: [],
    };

    this.serieService
      .createSerie(newSerie.name, newSerie.year.toString())
      .subscribe((createdSerie) => {
        this.series.push(createdSerie);
      });
  }

  deleteSerie(index: number) {
    const serieToDelete = this.series[index];
    this.serieService.deleteSerie(serieToDelete._id).subscribe(() => {
      this.series.splice(index, 1);
    });
  }

  addPhotoToSerie(serieIndex: number) {
    const newPhoto: Omit<Photo, '_id' | 'createdAt' | 'updatedAt'> = {
      title: '',
      path: '',
      date: '',
      size: 0,
      serie: this.series[serieIndex]._id,
    };

    this.photoService.createPhoto(newPhoto).subscribe((createdPhoto) => {
      this.series[serieIndex].photos.push(createdPhoto);
    });
  }

  deletePhoto(serieIndex: number, photoIndex: number) {
    const photoToDelete = this.series[serieIndex].photos[photoIndex];
    if (photoToDelete._id) {
      this.photoService.deletePhoto(photoToDelete._id).subscribe(() => {
        this.series[serieIndex].photos.splice(photoIndex, 1);
      });
    }
  }

  onPhotoUpload(event: any, serieIndex: number, photoIndex: number) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.series[serieIndex].photos[photoIndex].path = e.target.result;
      };

      reader.readAsDataURL(file);

      this.series[serieIndex].photos[photoIndex].size = parseFloat(
        (file.size / 1024).toFixed(2)
      );

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', this.series[serieIndex].photos[photoIndex].title);
    }
  }

  modifiedSeries = new Set<Serie>();
  modifiedPhotos = new Set<Photo>();

  onSerieChange(value: any, serie: Serie) {
    serie.title = value; // Mettre à jour localement
    this.modifiedSeries.add(serie); // Ajouter à la liste des changements
  }

  onPhotoChange(value: any, photo: Photo) {
    photo.title = value;
    this.modifiedPhotos.add(photo);
  }

  commitChanges() {
    const updateSerieRequests = Array.from(this.modifiedSeries).map((serie) =>
      this.serieService.updateSerie(
        serie._id,
        serie.title,
        serie.years.toString()
      )
    );

    const updatePhotoRequests = Array.from(this.modifiedPhotos).map((photo) =>
      this.photoService.updatePhoto(photo._id, {
        title: photo.title,
        path: photo.path,
        date: photo.date,
        size: photo.size,
        serie: photo.serie,
      })
    );

    // Exécuter toutes les requêtes en parallèle
    forkJoin([...updateSerieRequests, ...updatePhotoRequests]).subscribe({
      next: () => {
        console.log('Modifications enregistrées avec succès');
        this.modifiedSeries.clear();
        this.modifiedPhotos.clear();
      },
      error: (error) => console.error('Erreur lors de l’enregistrement', error),
    });
  }
}
