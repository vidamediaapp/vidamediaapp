import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Añadimos las herramientas para formularios reactivos y validaciones
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
// 2. Importamos TODOS los elementos que te marcaban error en la consola
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonIcon, 
  IonList, 
  IonItem, 
  IonInput, 
  IonButton, 
  IonText,
  IonButtons,
  IonBackButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  // 3. Declaramos los módulos e iconos para que el HTML los reconozca
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonIcon, 
    IonList, 
    IonItem, 
    IonInput, 
    IonButton, 
    IonText, 
    IonButtons,
    IonBackButton,
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule // <-- Obligatorio para vincular [formGroup]
  ]
})
export class RegistroPage implements OnInit {

  // 4. Creamos la propiedad que el HTML te reclamaba como "does not exist"
  formularioregistro!: FormGroup;

  // Inyectamos FormBuilder para estructurar los campos
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    // Definimos las reglas de cada campo del formulario
    this.formularioregistro = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      // Validador personalizado para asegurar que las contraseñas coincidan
      validators: this.passwordMatchValidator
    });
  }

  // Compara si la contraseña y la confirmación son idénticas
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  registrar() {
    if (this.formularioregistro.valid) {
      console.log('¡Registro exitoso!', this.formularioregistro.value);
    } else {
      this.formularioregistro.markAllAsTouched();
    }
  }

}