import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../services/api/auth.service';
import { AdminNavComponent } from '../../../shared/components/admin-nav/admin-nav.component';

// Same rules as the API (backend/config/validation.js).
const PASSWORD_MIN_LENGTH = 10;
const USERNAME_PATTERN = /^[a-zA-Z0-9]{3,30}$/;

// Translation key for each API error status.
const ERROR_KEYS: Record<number, string> = {
  401: 'admin.accountErrors.sessionExpired',
  403: 'admin.accountErrors.wrongCurrent',
  409: 'admin.accountErrors.usernameTaken',
  429: 'admin.accountErrors.tooManyAttempts',
};

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin-account',
  imports: [FormsModule, TranslatePipe, AdminNavComponent],
  templateUrl: './account-admin.component.html',
})
export class AccountAdminComponent implements OnInit {
  readonly minLength = PASSWORD_MIN_LENGTH;

  username = '';
  newUsername = '';
  newPassword = '';
  confirmPassword = '';
  currentPassword = '';
  saving = false;

  // Translation keys, so messages follow language switches.
  error: string | null = null;
  success = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.getAccount().subscribe({
      next: (account) => {
        this.username = account.username;
        this.newUsername = account.username;
      },
      error: (err) => (this.error = ERROR_KEYS[err?.status] ?? 'admin.accountErrors.generic'),
    });
  }

  save(): void {
    this.error = null;
    this.success = false;

    const newUsername = this.newUsername.trim();
    const usernameChanged = newUsername !== this.username;

    if (!usernameChanged && !this.newPassword) {
      this.error = 'admin.accountErrors.nothingToChange';
      return;
    }

    if (usernameChanged && !USERNAME_PATTERN.test(newUsername)) {
      this.error = 'admin.accountErrors.usernameInvalid';
      return;
    }

    if (this.newPassword && this.newPassword.length < this.minLength) {
      this.error = 'admin.accountErrors.tooShort';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'admin.accountErrors.mismatch';
      return;
    }

    this.saving = true;

    this.authService.updateAccount({
      currentPassword: this.currentPassword,
      ...(usernameChanged && { newUsername }),
      ...(this.newPassword && { newPassword: this.newPassword }),
    }).subscribe({
      next: (account) => {
        this.saving = false;
        this.success = true;
        this.username = account.username;
        this.newUsername = account.username;
        this.newPassword = '';
        this.confirmPassword = '';
        this.currentPassword = '';
      },
      error: (err) => {
        this.saving = false;
        this.error = ERROR_KEYS[err?.status] ?? 'admin.accountErrors.generic';
      },
    });
  }
}
