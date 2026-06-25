import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router'; 
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonIcon, 
  IonList, 
  IonItem, 
  IonInput, 
  IonNote, 
  IonButton, 
  IonText 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonIcon, 
    IonList, 
    IonItem, 
    IonInput, 
    IonNote, 
    IonButton, 
    IonText, 
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ]
})
export class LoginPage implements OnInit {

  formulariologin!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.formulariologin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ingresar() {
    if (this.formulariologin.valid) {
      console.log('Datos del formulario:', this.formulariologin.value);
    } else {
      this.formulariologin.markAllAsTouched();
    }
  }

  irARegistro() {
    this.router.navigate(['/registro']); 
  }

}