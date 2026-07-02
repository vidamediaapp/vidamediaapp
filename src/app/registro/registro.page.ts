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
  alertCircleOutline, arrowBackOutline, shieldCheckmarkOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonIcon, IonButton, IonSpinner,
} from '@ionic/angular/standalone';

// ── Validador de RUT chileno ───────────────────────────────────────
function rutValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().replace(/\./g, '').replace(/-/g, '').trim();
  if (!raw) return null;
  if (!/^\d{7,8}[0-9kK]$/.test(raw)) return { rutInvalid: true };

  const body  = raw.slice(0, -1);
  const dv    = raw.slice(-1).toUpperCase();
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expected = 11 - (sum % 11);
  const dvExpected = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
  return dv === dvExpected ? null : { rutInvalid: true };
}

// ── Formateador de RUT mientras escribe ───────────────────────────
function formatRut(value: string): string {
  const clean = value.replace(/\./g, '').replace(/-/g, '').replace(/[^0-9kK]/gi, '');
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv   = clean.slice(-1);
  const bodyFormatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${bodyFormatted}-${dv}`;
}

// ── Validador de teléfono chileno (+56 9 XXXX XXXX) ───────────────
function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().replace(/\s/g, '').replace(/-/g, '');
  if (!raw) return null;
  const pattern = /^(\+?56)?9\d{8}$/;
  return pattern.test(raw) ? null : { phoneInvalid: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonIcon, IonButton, IonSpinner,
  ],
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {

  form: FormGroup;
  loading  = signal(false);
  showPass = signal(false);
  submitted = signal(false);

  constructor(private fb: FormBuilder, private router: Router) {
    addIcons({
      personOutline, mailOutline, callOutline, cardOutline,
      eyeOutline, eyeOffOutline, checkmarkCircleOutline,
      alertCircleOutline, arrowBackOutline, shieldCheckmarkOutline,
      chevronForwardOutline,
    });

    this.form = this.fb.group({
      rut:            ['', [Validators.required, rutValidator]],
      email:          ['', [Validators.required, Validators.email]],
      nombre:         ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      apellidoPat:    ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      apellidoMat:    ['', [Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/)]],
      telefono:       ['', [Validators.required, phoneValidator]],
      password:       ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm:['', [Validators.required]],
    }, { validators: this.passwordsMatch });
  }

  // ── Getters de control ────────────────────────────────────────────
  get c() { return this.form.controls; }

  // ── Mensajes de error por campo ───────────────────────────────────
  error(field: string): string | null {
    const ctrl = this.form.get(field);
    if (!ctrl || (!ctrl.touched && !this.submitted())) return null;
    if (!ctrl.errors) return null;

    const msgs: Record<string, Record<string, string>> = {
      rut:         { required: 'Ingresa tu RUT', rutInvalid: 'RUT inválido. Ej: 12.345.678-9' },
      email:       { required: 'Ingresa tu correo', email: 'Correo inválido. Ej: nombre@correo.cl' },
      nombre:      { required: 'Ingresa tu nombre', minlength: 'Mínimo 2 caracteres', pattern: 'Solo letras' },
      apellidoPat: { required: 'Ingresa tu apellido paterno', minlength: 'Mínimo 2 caracteres', pattern: 'Solo letras' },
      apellidoMat: { minlength: 'Mínimo 2 caracteres', pattern: 'Solo letras' },
      telefono:    { required: 'Ingresa tu teléfono', phoneInvalid: 'Ej: +56 9 1234 5678 o 9 1234 5678' },
      password:    { required: 'Ingresa una contraseña', minlength: 'Mínimo 8 caracteres' },
      passwordConfirm: { required: 'Confirma tu contraseña', passwordsMismatch: 'Las contraseñas no coinciden' },
    };

    const fieldMsgs = msgs[field] ?? {};
    for (const key of Object.keys(ctrl.errors)) {
      if (fieldMsgs[key]) return fieldMsgs[key];
    }
    return null;
  }

  // ── Formateo de RUT en tiempo real ────────────────────────────────
  onRutInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatRut(input.value);
    this.form.get('rut')!.setValue(formatted, { emitEvent: false });
    input.value = formatted;
  }

  // ── Solo letras en campos de nombre ───────────────────────────────
  onNameInput(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const clean = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    if (clean !== input.value) {
      this.form.get(field)!.setValue(clean, { emitEvent: false });
      input.value = clean;
    }
  }

  // ── Solo números en teléfono (permite + al inicio) ────────────────
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let clean = input.value.replace(/[^0-9+\s-]/g, '');
    this.form.get('telefono')!.setValue(clean, { emitEvent: false });
    input.value = clean;
  }

  togglePass(): void { this.showPass.update(v => !v); }

  // ── Enviar ────────────────────────────────────────────────────────
  onSubmit(): void {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.loading.set(true);
    // Simula llamada al backend — reemplazar por this.authService.register()
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/home']);
    }, 1500);
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
