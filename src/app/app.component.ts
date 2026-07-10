import { Component, inject, OnInit, LOCALE_ID } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/services/auth.service';
import { registerLocaleData } from '@angular/common';
import localeEsCL from '@angular/common/locales/es-CL';


registerLocaleData(localeEsCL, 'es-CL');

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-CL' }
  ]
})
export class AppComponent implements OnInit {
  private auth = inject(AuthService);

  async ngOnInit(): Promise<void> {
    await this.auth.init();
    console.log('Sesión inicializada. Token:', this.auth.token() ? 'Disponible' : 'NULL');
  }
}