import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, Area } from '../../services/api.service';
import { CreateTaskModal } from '../../pages/create-task/create-task.modal'; // 👈 importa el modal
import { ModalController } from '@ionic/angular';

// 🔹 Importar y registrar el ícono manualmente
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
addIcons({ logOutOutline });

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
    private router: Router,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.loading = true;

    // Recuperar usuario guardado localmente
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name;
      this.userEmail = user.email;
    }

    // Obtener datos actualizados del backend
    this.api.me().subscribe({
      next: (user) => {
        console.log('✅ Usuario recibido:', user);

        // Obtener roles desde el array de áreas
        const roles = (user.areas || []).map((a: any) => a.role?.toUpperCase());
        this.isCoordinator = roles.includes('COORDINADOR');
        console.log('¿Es coordinador?', this.isCoordinator);

        // Cargar datos según rol
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

  // 🔹 Si es coordinador, carga las áreas
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

  // 🔹 Si es empleado normal, carga estadísticas de tareas
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

  // 🔹 Navegar a estadísticas de un área específica
  viewAreaStats(areaId: number) {
    this.router.navigate(['/tabs/stats'], {
      queryParams: { areaId }
    });
  }

  // 🔹 Refrescar manualmente
  refresh(event: any) {
    this.loadUserData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
   // 🟢 Modal para crear una nueva tarea
  async openCreateTaskModal() {
    const modal = await this.modalCtrl.create({
      component: CreateTaskModal,
      componentProps: {
        areas: this.areas
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.refresh) {
      this.loadAreas(); // recargar si se creó una tarea nueva
    }
  }

  // 🔹 Cerrar sesión
  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}
