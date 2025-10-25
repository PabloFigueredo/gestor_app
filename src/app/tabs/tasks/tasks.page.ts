import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Task } from '../../services/api.service';
import { AlertController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';


interface TaskWithImportant extends Task {
  isImportant?: boolean;
}
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: `./tasks.page.html`,
  styleUrls: [`./tasks.page.css`]
})
export class TasksTabPage {
  tasks: TaskWithImportant[] = [];
  filteredTasks: TaskWithImportant[] = [];
  filterStatus: string = 'all';
  loading = true;

constructor(private api: ApiService, private alertCtrl: AlertController) {
  addIcons({ star, starOutline });
}

  ngOnInit() {
    this.loadTasks();
  }
  toggleImportant(task: any) {
  task.isImportant = !task.isImportant;
  const importantTasks = JSON.parse(localStorage.getItem('importantTasks') || '{}');
  importantTasks[task.id] = task.isImportant;
  localStorage.setItem('importantTasks', JSON.stringify(importantTasks));
}
  loadTasks() {
  this.loading = true;
  this.api.getMyTasks().subscribe({
    next: (tasks) => {
      const importantTasks = JSON.parse(localStorage.getItem('importantTasks') || '{}');
      this.tasks = tasks.map(t => ({
        ...t,
        isImportant: importantTasks[t.id] || false
      }));

      this.filterTasks();     
      this.loading = false;
      this.showUrgentAlert(); 
    },
    error: () => {
      this.loading = false;
    }
  });
}
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

  filterTasks() {
    if (this.filterStatus === 'important') {
      this.filteredTasks = this.tasks.filter((t: any) => t.isImportant);
    }else if (this.filterStatus === 'all') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(t => t.status === this.filterStatus);
    }
  }
  getDueColor(due_at: string | null): string {
  if (!due_at) return 'medium';
  const diffDays = (new Date(due_at).getTime() - Date.now()) / (1000 * 3600 * 24);
  if (diffDays < 0) return 'danger';       // vencida
  if (diffDays <= 2) return 'warning';     // cerca
  return 'success';                        // normal
}

  searchText: string = '';

applyFilters() {
  let filtered = this.tasks;
  
  // Filtrar por estado
  if (this.filterStatus !== 'all') {
    filtered = filtered.filter(t => t.status === this.filterStatus);
  }

  // Filtrar por texto
  if (this.searchText.trim() !== '') {
    const term = this.searchText.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(term) || 
      (t.description?.toLowerCase().includes(term))
    );
  }

  this.filteredTasks = filtered;
}


  openTaskDetail(task: Task) {
    console.log('Abrir detalle:', task);
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

  refresh(event: any) {
    this.loadTasks();
    setTimeout(() => event.target.complete(), 1000);
  }
}