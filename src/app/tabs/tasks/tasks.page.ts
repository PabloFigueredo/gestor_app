import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Task } from '../../services/api.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: `./tasks.page.html`,
  styleUrls: [`./tasks.page.css`]
})
export class TasksTabPage {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterStatus: string = 'all';
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.api.getMyTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filterTasks();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterTasks() {
    if (this.filterStatus === 'all') {
      this.filteredTasks = this.tasks;
    } else {
      this.filteredTasks = this.tasks.filter(t => t.status === this.filterStatus);
    }
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