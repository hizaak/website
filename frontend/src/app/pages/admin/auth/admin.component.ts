import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../core/toast.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  providers: [MessageService, ToastService],
})
export class AdminComponent {
  adminForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
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

    this.authService.login(username, password).subscribe(
      (response) => {
        if (response) {
          this.router.navigate(['/dashboard/works']);
          this.toastService.showSuccess(
            'Connexion réussie',
            'Bienvenue dans le dashboard'
          );
        } else {
          this.errorMessage = 'Identifiants incorrects';
          this.toastService.showError(
            'Erreur',
            "Nom d'utilisateur ou mot de passe incorrect"
          );
        }
      },
      (error) => {
        this.toastService.showError(
          'Erreur',
          'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    );
  }
}
