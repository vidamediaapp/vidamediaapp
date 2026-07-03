import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline,
  shieldCheckmarkOutline, alertCircleOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonIcon, IonSpinner,
} from '@ionic/angular/standalone';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonIcon, IonSpinner,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading   = signal(false);
  showPass  = signal(false);
  apiError  = signal<string | null>(null);
  submitted = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    addIcons({
      mailOutline, lockClosedOutline,
      eyeOutline, eyeOffOutline,
      shieldCheckmarkOutline, alertCircleOutline,
    });
  }

  get c() { return this.form.controls; }

  emailError(): string | null {
    const c = this.c['email'];
    if (!c.touched && !this.submitted()) return null;
    if (c.errors?.['required']) return 'Ingresa tu correo';
    if (c.errors?.['email'])    return 'Correo inválido. Ej: nombre@correo.cl';
    return null;
  }

  passError(): string | null {
    const c = this.c['password'];
    if (!c.touched && !this.submitted()) return null;
    if (c.errors?.['required'])   return 'Ingresa tu contraseña';
    if (c.errors?.['minlength'])  return 'Mínimo 8 caracteres';
    return null;
  }

  togglePass(): void { this.showPass.update(v => !v); }

  onSubmit(): void {
    this.submitted.set(true);
    this.apiError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);

    this.auth.login({
      email:    this.form.value.email!,
      password: this.form.value.password!,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.apiError.set(err.message);
      },
    });
  }
}
