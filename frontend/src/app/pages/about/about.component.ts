import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  // Document uploaded from the admin under the name "cv".
  cvUrl = `${environment.documentsUrl}/cv`;
}
