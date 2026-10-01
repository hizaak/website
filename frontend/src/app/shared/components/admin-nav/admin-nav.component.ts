import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../services/api/auth.service';
import { AdminNavigationService } from '../../../core/admin-navigation.service';

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-nav',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './admin-nav.component.html',
  styleUrl: './admin-nav.component.scss',
})
export class AdminNavComponent {
  constructor(
    public adminNavigation: AdminNavigationService,
    private authService: AuthService
  ) { }

  logout(): void {
    this.authService.logout();
    this.adminNavigation.toAuth();
  }
}
