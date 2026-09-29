import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WorkService } from '../../../services/api/work.service';
import { AdminNavigationService } from '../../../core/admin-navigation.service';
import { Work } from '../../../interfaces/Work';
import { TranslatePipe } from '@ngx-translate/core';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav.component';

@Component({
  selector: 'app-admin-works',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, AdminNavComponent],
  templateUrl: './works-admin.component.html',
  styleUrl: './works-admin.component.scss',
})
export class WorksAdminComponent implements OnInit {
  works: Work[] = [];
  newTitle = '';
  error: string | null = null;

  constructor(
    private workService: WorkService,
    private adminNavigation: AdminNavigationService
  ) { }

  ngOnInit(): void {
    this.loadWorks();
  }

  loadWorks(): void {
    this.workService.getAllWorks().subscribe({
      next: (works) => (this.works = works),
      error: () => (this.error = 'Erreur lors du chargement.'),
    });
  }

  createWork(): void {
    if (!this.newTitle.trim()) {
      return;
    }

    this.workService.createWork(this.newTitle.trim()).subscribe({
      next: () => {
        this.newTitle = '';
        this.loadWorks();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création.';
      },
    });
  }

  deleteWork(work: Work): void {
    if (!confirm(`Supprimer le work "${work.title}" et toutes ses photos ?`)) {
      return;
    }

    this.workService.deleteWork(work._id).subscribe({
      next: () => this.loadWorks(),
      error: () => (this.error = 'Erreur lors de la suppression.'),
    });
  }

  openWork(work: Work): void {
    this.adminNavigation.toWork(work._id);
  }
}
