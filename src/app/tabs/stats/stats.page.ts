import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms'; // 👈 AGREGAR ESTO

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule], // 👈 AGREGAR FormsModule AQUÍ
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: `./stats.page.html`,
  styleUrls: [`./stats.page.css`]
})
export class StatsTabPage {
  isCoordinator = false;
  areas: any[] = [];
  selectedAreaId: number = 0;
  stats: any = null;
  members: any[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.api.me().subscribe({
      next: (user) => {
        this.isCoordinator = !!(user.areas && user.areas.length > 0);
        
        if (this.isCoordinator) {
          this.loadAreas();
        } else {
          this.loadPersonalStats();
        }
      }
    });
  }

  loadAreas() {
    this.api.getMyAreas().subscribe({
      next: (areas) => {
        this.areas = areas;
        if (areas.length > 0) {
          this.selectedAreaId = areas[0].id;
          this.loadStats();
        }
      }
    });
  }

  loadStats() {
    if (!this.selectedAreaId) return;
    
    this.loading = true;

    this.api.getStats(this.selectedAreaId).subscribe({
      next: (stats) => {
        this.stats = stats;
      }
    });

    this.api.getAreaMembers(this.selectedAreaId).subscribe({
      next: (members) => {
        this.members = members;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadPersonalStats() {
    this.api.getMyTasks().subscribe({
      next: (tasks) => {
        this.stats = {
          total: tasks.length,
          nuevas: tasks.filter(t => t.status === 'NUEVA').length,
          en_progreso: tasks.filter(t => t.status === 'EN_PROGRESO').length,
          completadas: tasks.filter(t => t.status === 'COMPLETADA').length
        };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  refresh(event: any) {
    if (this.isCoordinator) {
      this.loadStats();
    } else {
      this.loadPersonalStats();
    }
    setTimeout(() => event.target.complete(), 1000);
  }
}
