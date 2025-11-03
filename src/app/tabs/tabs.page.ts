import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  homeOutline, 
  listOutline, 
  statsChartOutline, 
  personOutline,
  appsOutline,
  shieldCheckmarkOutline,
  timeOutline,
  lockClosedOutline,
  mailOutline,
  addCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.css']
})
export class TabsPage implements OnInit {
  isCoordinator: boolean = false;

  constructor(private router: Router) {
    // Registrar TODOS los íconos que usás en la app
    addIcons({
      'home-outline': homeOutline,
      'list-outline': listOutline,
      'stats-chart-outline': statsChartOutline,
      'person-outline': personOutline,
      'apps-outline': appsOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'time-outline': timeOutline,
      'lock-closed-outline': lockClosedOutline,
      'mail-outline': mailOutline,
      'add-circle-outline': addCircleOutline
    });
  }

  ngOnInit() {
    // Detectar rol del usuario guardado en localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const roles = (user.areas || []).map((a: any) => a.role?.toUpperCase());
      this.isCoordinator = roles.includes('COORDINADOR');
      console.log('¿Usuario es coordinador?', this.isCoordinator);
    }

    // 🔒 Bloquear acceso directo si no es coordinador y está en /tabs/stats
    const currentUrl = window.location.href;
    if (!this.isCoordinator && currentUrl.includes('/tabs/stats')) {
      console.warn('Acceso bloqueado: solo coordinadores pueden ver estadísticas.');
      this.router.navigateByUrl('/tabs/home');
    }
  }
}
