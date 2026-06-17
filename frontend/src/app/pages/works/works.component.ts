import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WorksPageService } from '../../services/pages/works-page.service';
import { WorkListItem } from '../../interfaces/pages/WorksPage';

import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './works.component.html',
  styleUrl: './works.component.scss',
})
export class WorksComponent implements OnInit {
  works: WorkListItem[] = [];
  error: string | null = null;

  constructor(
    private worksPageService: WorksPageService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.worksPageService.getWorks().subscribe({
      next: (works) => {
        this.works = works;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des works.';
      },
    });
  }
}