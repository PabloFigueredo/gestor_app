import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Task } from '../../services/api.service';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';
import { TaskDetailModal } from '../../pages/task-detail/task-detail.modal';
interface TaskWithImportant extends Task {
  isImportant?: boolean;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.css']
})
export class TasksTabPage {
  tasks: TaskWithImportant[] = [];
  filteredTasks: TaskWithImportant[] = [];
  filterStatus: string = 'all';
  searchText: string = '';
  loading = true;

  constructor(
    private api: ApiService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({ star, starOutline });
  }

  ngOnInit() {
    this.loadTasks();
  }

  // ⭐ Marcar como importante (solo frontend/localStorage)
  toggleImportant(task: TaskWithImportant) {
    task.isImportant = !task.isImportant;
    const importantTasks = JSON.parse(localStorage.getItem('importantTasks') || '{}');
    importantTasks[task.id] = task.isImportant;
    localStorage.setItem('importantTasks', JSON.stringify(importantTasks));
  }

  // 📥 Cargar tareas del backend
  loadTasks() {
    this.loading = true;
    this.api.getMyTasks().subscribe({
      next: (tasks) => {
        const importantTasks = JSON.parse(localStorage.getItem('importantTasks') || '{}');
        this.tasks = tasks.map(t => ({
          ...t,
          isImportant: importantTasks[t.id] || false
        }));
        this.applyFilters();
        this.loading = false;
        this.showUrgentAlert();
      },
      error: (err) => {
        console.error('❌ Error al cargar tareas', err);
        this.loading = false;
      }
    });
  }

  // ⚠️ Aviso de tareas urgentes
  async showUrgentAlert() {
    const urgent = this.tasks.filter(
      t =>
        this.getDueColor(t.due_at) === 'warning' ||
        this.getDueColor(t.due_at) === 'danger'
    );
    if (urgent.length > 0) {
      const alert = await this.alertCtrl.create({
        header: 'Tareas urgentes ⚠️',
        message: `Tienes ${urgent.length} tarea(s) próximas a vencer o vencidas.`,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  // 🔍 Filtros combinados (estado + texto + importantes)
  applyFilters() {
    let filtered = this.tasks;

    // por estado / importantes
    if (this.filterStatus === 'important') {
      filtered = filtered.filter(t => t.isImportant);
    } else if (this.filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === this.filterStatus);
    }

    // por texto
    if (this.searchText.trim() !== '') {
      const term = this.searchText.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(term) ||
        (t.description?.toLowerCase().includes(term))
      );
    }

    this.filteredTasks = filtered;
  }

  getDueColor(due_at: string | null): string {
    if (!due_at) return 'medium';
    const diffDays = (new Date(due_at).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (diffDays < 0) return 'danger';
    if (diffDays <= 2) return 'warning';
    return 'success';
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'NUEVA': 'primary',
      'EN_PROGRESO': 'warning',
      'COMPLETADA': 'success',
      'CANCELADA': 'danger'
    };
    return colors[status] || 'medium';
  }

  getUrgencyColor(urgency: string): string {
    const colors: any = {
      'BAJA': 'success',
      'MEDIA': 'warning',
      'ALTA': 'danger'
    };
    return colors[urgency] || 'medium';
  }

  formatDate(date: string | null): string {
    if (!date) return 'Sin fecha límite';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // 🧹 Pull-to-refresh
  refresh(event: any) {
    this.loadTasks();
    setTimeout(() => event.target.complete(), 1000);
  }

  // 👇 Al tocar una tarea → abrir modal de detalle
  async openTaskDetail(task: TaskWithImportant) {
    const modal = await this.modalCtrl.create({
      component: TaskDetailModal,
      componentProps: {
        task: { ...task } // copia, para no romper referencia si se cancela
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    // Si se actualizó la tarea en el modal, la reflejamos en la lista
    if (data?.updated) {
      const idx = this.tasks.findIndex(t => t.id === data.updated.id);
      if (idx !== -1) {
        this.tasks[idx] = {
          ...this.tasks[idx],
          ...data.updated
        };
      }
      this.applyFilters();
    }
  }
}
