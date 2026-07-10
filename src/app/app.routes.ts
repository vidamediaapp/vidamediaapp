import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
  {
    path: 'simulador',
    loadComponent: () => import('./simulator/simulator.page').then(m => m.SimulatorPage),
    canActivate: [authGuard],
  },

  {
    path: 'defensa',
    loadComponent: () => import('./defensa/defensa.page').then(m => m.DefensaPage),
    canActivate: [authGuard],
},

 { path: 'deudas',
    loadComponent: () => import('./deudas/deudas.page').then(m => m.DeudasPage),
    canActivate: [authGuard],
},

{
    path: 'pagos',
    loadComponent: () => import('./pagos/pagos.page').then(m => m.PagosPage),
    canActivate: [authGuard],
},
  
  

  { path: '**', redirectTo: 'login' },
];
