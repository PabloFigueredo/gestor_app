import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: `./profile.page.html`,
  styleUrls: [`./profile.page.css`]
})
export class ProfilePage {
  role: string = '';
  userName: string = '';
  userEmail: string = '';
  isCoordinator: boolean = false;
  areasCount: number = 0;
  loading = true;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name;
      this.userEmail = user.email;

      this.api.me().subscribe({
        next: (user) => {
          console.log('👤 Usuario recibido:', user);

          // Extraer roles desde las áreas
          const roles = (user.areas || []).map((a: any) => a.role?.toUpperCase());
          this.role = roles[0] || 'SIN ROL';
          this.isCoordinator = roles.includes('COORDINADOR');
          this.areasCount = user.areas?.length || 0;

          console.log('Rol detectado:', this.role);
          console.log('¿Es coordinador?', this.isCoordinator);

          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error al cargar usuario:', err);
          this.loading = false;
        }
      });
    }
  }

  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}
