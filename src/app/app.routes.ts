import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],   // si ya hay sesión va directo a home
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage),
  },
  {
    path: 'home',
    canActivate: [authGuard],    // requiere sesión
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'presupuesto',
    canActivate: [authGuard],    // requiere sesión
    loadComponent: () => import('./presupuesto/presupuesto.page').then(m => m.PresupuestoPage),
  },
  { path: '**', redirectTo: 'login' },
];
