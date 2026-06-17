import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../core/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  constructor(
    public languageService: LanguageService
  ) {}
}