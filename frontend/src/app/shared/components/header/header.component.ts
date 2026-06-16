import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LanguageService } from '../../../core/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(
    public languageService: LanguageService
  ) {}
}