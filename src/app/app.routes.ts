import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
  {
    path: 'presupuesto',
    loadComponent: () => import('./presupuesto/presupuesto.page').then(m => m.PresupuestoPage),
  },
  { path: '**', redirectTo: 'login' },
];
