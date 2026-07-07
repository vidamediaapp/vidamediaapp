import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  personOutline, mailOutline, callOutline, cardOutline,
  eyeOutline, eyeOffOutline, checkmarkCircleOutline,
  alertCircleOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonIcon, IonSpinner,
} from '@ionic/angular/standalone';

import { AuthService } from '../core/services/auth.service';

function rutValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().replace(/\./g, '').replace(/-/g, '').trim();
  if (!raw) return null;
  if (!/^\d{7,8}[0-9kK]$/.test(raw)) return { rutInvalid: true };
  const body = raw.slice(0, -1);
  const dv   = raw.slice(-1).toUpperCase();
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const exp   = 11 - (sum % 11);
  const dvExp = exp === 11 ? '0' : exp === 10 ? 'K' : String(exp);
  return dv === dvExp ? null : { rutInvalid: true };
}

function formatRut(value: string): string {
  const clean = value.replace(/\./g, '').replace(/-/g, '').replace(/[^0-9kK]/gi, '');
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${body}-${clean.slice(-1)}`;
}

function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().replace(/\s/g, '').replace(/-/g, '');
  if (!raw) return null;
  return /^(\+?56)?9\d{8}$/.test(raw) ? null : { phoneInvalid: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonIcon, IonSpinner,
  ],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {

  form: FormGroup;
  loading   = signal(false);
  showPass  = signal(false);
  submitted = signal(false);
  apiError  = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    addIcons({
      personOutline, mailOutline, callOutline, cardOutline,
      eyeOutline, eyeOffOutline, checkmarkCircleOutline,
      alertCircleOutline, shieldCheckmarkOutline,
    });

    this.form = this.fb.group({
      rut:             ['', [Validators.required, rutValidator]],
      email:           ['', [Validators.required, Validators.email]],
      nombre:          ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      apaterno:        ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      amaterno:        ['', [Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      telefono:        ['', [Validators.required, phoneValidator]],
      password:        ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
    }, { validators: this.passwordsMatch });
  }

  get c() { return this.form.controls; }

  error(field: string): string | null {
    const ctrl = this.form.get(field);
    if (!ctrl || (!ctrl.touched && !this.submitted())) return null;
    if (!ctrl.errors) return null;

    const msgs: Record<string, Record<string, string>> = {
      rut:             { required: 'Ingresa tu RUT', rutInvalid: 'RUT inválido. Ej: 12.345.678-9' },
      email:           { required: 'Ingresa tu correo', email: 'Correo inválido. Ej: nombre@correo.cl' },
      nombre:          { required: 'Ingresa tu nombre', minlength: 'Mínimo 2 caracteres', pattern: 'Solo letras' },
      apaterno:        { required: 'Ingresa tu apellido paterno', minlength: 'Mínimo 2 caracteres', pattern: 'Solo letras' },
      amaterno:        { minlength: 'Mínimo 2 caracteres', pattern: 'Solo letras' },
      telefono:        { required: 'Ingresa tu teléfono', phoneInvalid: 'Ej: +56 9 1234 5678' },
      password:        { required: 'Ingresa una contraseña', minlength: 'Mínimo 8 caracteres' },
      passwordConfirm: { required: 'Confirma tu contraseña', passwordsMismatch: 'Las contraseñas no coinciden' },
    };

    const fieldMsgs = msgs[field] ?? {};
    for (const key of Object.keys(ctrl.errors)) {
      if (fieldMsgs[key]) return fieldMsgs[key];
    }
    return null;
  }

  onRutInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const fmt   = formatRut(input.value);
    this.form.get('rut')!.setValue(fmt, { emitEvent: false });
    input.value = fmt;
  }

  onNameInput(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    if (clean !== input.value) {
      this.form.get(field)!.setValue(clean, { emitEvent: false });
      input.value = clean;
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/[^0-9+\s-]/g, '');
    this.form.get('telefono')!.setValue(clean, { emitEvent: false });
    input.value = clean;
  }

  togglePass(): void { this.showPass.update(v => !v); }

  onSubmit(): void {
    this.submitted.set(true);
    this.apiError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);

    // Mapeo exacto a RegistroDto con campos de Diego
    this.auth.registro({
      rut:      this.form.value.rut,
      email:    this.form.value.email,
      nombre:   this.form.value.nombre,
      apaterno: this.form.value.apaterno,         // ← campo de Diego
      amaterno: this.form.value.amaterno || undefined,  // ← campo de Diego
      telefono: this.form.value.telefono,
      password: this.form.value.password,
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

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pw  = group.get('password')?.value;
    const cpw = group.get('passwordConfirm')?.value;
    if (!cpw) return null;
    if (pw !== cpw) {
      group.get('passwordConfirm')!.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    }
    return null;
  }
}
