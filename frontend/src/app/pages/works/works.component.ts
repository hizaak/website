import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WorkService } from '../../services/api/work.service';
import { Work } from '../../interfaces/Work';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './works.component.html',
  styleUrl: './works.component.scss',
})
export class WorksComponent implements OnInit {
  works: Work[] = [];
  error: string | null = null;

constructor(
  private workService: WorkService,
  public languageService: LanguageService
) {}

  ngOnInit(): void {
    this.workService.getAllWorks().subscribe({
      next: (works) => (this.works = works),
      error: () => (this.error = 'Erreur lors du chargement des works.'),
    });
  }
}