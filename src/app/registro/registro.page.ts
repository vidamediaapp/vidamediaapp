import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  cardOutline, mailOutline, personOutline, callOutline, 
  shieldCheckmarkOutline, eyeOutline, eyeOffOutline, 
  alertCircleOutline, checkmarkCircleOutline 
} from 'ionicons/icons';

import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterLink]
})
export class RegistroPage implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form!: FormGroup;
  loading = signal<boolean>(false);
  apiError = signal<string | null>(null);
  showPass = signal<boolean>(false);

  constructor() {
    addIcons({
      cardOutline, mailOutline, personOutline, callOutline,
      shieldCheckmarkOutline, eyeOutline, eyeOffOutline,
      alertCircleOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      rut: ['', [Validators.required, Validators.pattern(/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]{1}$/)]],
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required]],
      apellidoPat: ['', [Validators.required]],
      apellidoMat: [''],
      telefono: ['', [Validators.required, Validators.minLength(9)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get c() { return this.form.controls; }

  togglePass(): void { this.showPass.update(v => !v); }

  error(field: string): string | null {
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return null;

    if (control.errors['required']) return 'Este campo es obligatorio.';
    if (control.errors['email']) return 'Ingresa un correo electrónico válido.';
    if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres.`;
    if (control.errors['pattern']) return 'Formato de RUT inválido.';
    if (control.errors['mustMatch']) return 'Las contraseñas no coinciden.';
    
    return 'Campo inválido.';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set(null);

    const formValue = this.form.value;

    this.auth.register({
      rut: formValue.rut,
      email: formValue.email,
      nombre: formValue.nombre,
      apaterno: formValue.apellidoPat,
      amaterno: formValue.apellidoMat || '',
      telefono: formValue.telefono,
      password: formValue.password,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.apiError.set(err?.message || 'Error al crear la cuenta.');
      }
    });
  }

  onRutInput(event: any): void {
    let value = event.target.value.replace(/[^0-9kK]/g, '');
    if (value.length > 1) {
      const dv = value.slice(-1);
      let rut = value.slice(0, -1);
      rut = rut.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      value = `${rut}-${dv}`;
    }
    this.form.get('rut')?.setValue(value, { emitEvent: false });
  }

  onNameInput(event: any, field: string): void {
    const value = event.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, '');
    this.form.get(field)?.setValue(value, { emitEvent: false });
  }

  onPhoneInput(event: any): void {
    let value = event.target.value.replace(/[^0-9+]/g, '');
    this.form.get('telefono')?.setValue(value, { emitEvent: false });
  }

  private passwordMatchValidator(g: FormGroup) {
    const pass = g.get('password')?.value;
    const conf = g.get('passwordConfirm')?.value;
    if (pass !== conf) {
      g.get('passwordConfirm')?.setErrors({ mustMatch: true });
      return { mustMatch: true };
    }
    return null;
  }
}