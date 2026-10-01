import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { WorkService } from '../../../services/api/work.service';
import { AdminNavigationService } from '../../../core/admin-navigation.service';
import { Work } from '../../../interfaces/Work';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav.component';

@Component({
  selector: 'app-admin-works',
  imports: [FormsModule, TranslatePipe, AdminNavComponent],
  templateUrl: './works-admin.component.html',
})
export class WorksAdminComponent implements OnInit {
  works: Work[] = [];
  newTitle = '';
  // Translation key.
  error: string | null = null;

  constructor(
    private workService: WorkService,
    private adminNavigation: AdminNavigationService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadWorks();
  }

  loadWorks(): void {
    this.workService.getAllWorks().subscribe({
      next: (works) => (this.works = works),
      error: () => (this.error = 'admin.workErrors.load'),
    });
  }

  createWork(): void {
    if (!this.newTitle.trim()) {
      return;
    }

    this.workService.createWork(this.newTitle.trim()).subscribe({
      next: () => {
        this.newTitle = '';
        this.error = null;
        this.loadWorks();
      },
      error: (err) =>
        (this.error = err?.status === 409 ? 'admin.workErrors.titleTaken' : 'admin.workErrors.create'),
    });
  }

  deleteWork(work: Work): void {
    if (!confirm(this.translate.instant('admin.confirmDeleteWork', { title: work.title }))) {
      return;
    }

    this.workService.deleteWork(work._id).subscribe({
      next: () => this.loadWorks(),
      error: () => (this.error = 'admin.workErrors.delete'),
    });
  }

  openWork(work: Work): void {
    this.adminNavigation.toWork(work._id);
  }
}
