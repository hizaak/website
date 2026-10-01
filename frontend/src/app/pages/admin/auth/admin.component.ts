import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../services/api/auth.service';
import { AdminNavigationService } from '../../../core/admin-navigation.service';

// Translation key for each API error status.
const ERROR_KEYS: Record<number, string> = {
  401: 'admin.loginErrors.invalid',
  429: 'admin.loginErrors.tooManyAttempts',
};

@Component({
  // Updates plain fields, not signals: OnPush (the default) would miss them.
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-admin',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  adminForm: FormGroup;
  // Translation key, so the message follows language switches.
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private adminNavigation: AdminNavigationService
  ) {
    this.adminForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      return;
    }

    const { username, password } = this.adminForm.value;

    this.authService.login(username, password).subscribe({
      next: () => this.adminNavigation.toWorks(),
      error: (err) => (this.error = ERROR_KEYS[err?.status] ?? 'admin.loginErrors.generic'),
    });
  }
}
