import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, Area } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: `./home.page.html`,
  styleUrls: [`./home.page.css`]
})
export class HomePage {
  userName: string = '';
  userEmail: string = '';
  isCoordinator: boolean = false;
  areas: Area[] = [];
  taskStats = { total: 0, pending: 0, completed: 0 };
  loading = true;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.loading = true;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name;
      this.userEmail = user.email;
    }

    this.api.me().subscribe({
      next: (user) => {
        // Verificar rol específico del backend
        this.isCoordinator = !!(user.role === 'coordinator' || user.role === 'COORDINADOR');

        if (this.isCoordinator) {
          this.loadAreas();
        } else {
          this.loadTaskStats();
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar usuario:', err);
        this.loading = false;
      }
    });
  }

  loadAreas() {
    this.api.getMyAreas().subscribe({
      next: (areas) => {
        this.areas = areas;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadTaskStats() {
    this.api.getMyTasks().subscribe({
      next: (tasks) => {
        this.taskStats.total = tasks.length;
        this.taskStats.pending = tasks.filter(t => 
          t.status === 'NUEVA' || t.status === 'EN_PROGRESO'
        ).length;
        this.taskStats.completed = tasks.filter(t => 
          t.status === 'COMPLETADA'
        ).length;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  viewAreaStats(areaId: number) {
    this.router.navigate(['/tabs/stats'], { 
      queryParams: { areaId } 
    });
  }

  refresh(event: any) {
    this.loadUserData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}