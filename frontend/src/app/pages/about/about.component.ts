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
})
export class AboutComponent {
  // Document uploaded from the admin under the name "cv".
  cvUrl = `${environment.documentsUrl}/cv`;
  apiDocsUrl = `${environment.apiUrl}/api-docs/`;
  sourceUrl = 'https://github.com/hizaak/website';

  constructor(public languageService: LanguageService) { }
}
