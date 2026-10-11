import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { LanguageService } from '../../core/language.service';

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-about',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  // Documents uploaded from the admin under the names "cv" and "cv-en".
  cvFrUrl = `${environment.documentsUrl}/cv`;
  cvEnUrl = `${environment.documentsUrl}/cv-en`;
  apiDocsUrl = `${environment.apiUrl}/api-docs/`;
  sourceUrl = 'https://github.com/hizaak/website';

  constructor(public languageService: LanguageService) { }
}
