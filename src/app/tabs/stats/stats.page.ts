import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Area } from '../../services/api.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.css']
})
export class StatsPage {
  loading = true;

  isCoordinator = false;
  areas: Area[] = [];
  selectedAreaId: number | null = null;

  members: any[] = [];
  stats: any = null;   // lo que devuelve /areas/{id}/stats

  constructor(private api: ApiService) {}

  ngOnInit() {
    console.log('📊 [StatsPage] ngOnInit() iniciado');
    this.initPage();
  }

  // ================== INICIO DE PÁGINA ==================

  private initPage() {
    console.log('🚀 [StatsPage] Iniciando carga inicial...');
    this.loading = true;

    // 1) Preguntamos quién soy
    this.api.me().subscribe({
      next: (me) => {
        console.log('✅ [StatsPage] /me recibido:', me);

        // El usuario ya me dijiste que es coordinador, así que esto debería ser true
        this.isCoordinator = (me.role || '').toUpperCase() === 'COORDINADOR';
        console.log('🧭 [StatsPage] isCoordinator:', this.isCoordinator);

        // 2) Ahora sí, traemos las áreas desde /areas/mine
        this.loadAreas();
      },
      error: (err) => {
        console.error('❌ [StatsPage] Error al cargar /me:', err);
        this.loading = false;
      }
    });
  }

  private loadAreas() {
    console.log('📡 [StatsPage] GET /areas/mine');
    this.api.getMyAreas().subscribe({
      next: (areas) => {
        console.log('✅ [StatsPage] Áreas recibidas:', areas);
        this.areas = areas || [];

        if (this.areas.length > 0) {
          this.selectedAreaId = this.areas[0].id;
          console.log('📌 [StatsPage] Área seleccionada por defecto:', this.selectedAreaId);
          this.loadStats();
          this.loadMembers();
        } else {
          console.warn('⚠️ [StatsPage] El usuario no tiene áreas en /areas/mine');
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('❌ [StatsPage] Error al cargar /areas/mine:', err);
        this.loading = false;
      }
    });
  }

  // ================== CAMBIO DE ÁREA ==================

  onAreaChange() {
    console.log('🔁 [StatsPage] Cambio de área detectado:', this.selectedAreaId);
    if (!this.selectedAreaId) {
      console.warn('⚠️ [StatsPage] selectedAreaId es null al cambiar área');
      return;
    }
    this.loadStats();
    this.loadMembers();
  }

  // ================== CARGA DE STATS ==================

  loadStats() {
    if (!this.selectedAreaId) {
      console.warn('⚠️ [StatsPage] No hay área seleccionada. Abortando loadStats()');
      return;
    }

    console.log('📡 [StatsPage] GET /areas/' + this.selectedAreaId + '/stats');
    this.loading = true;

    this.api.getStats(this.selectedAreaId).subscribe({
      next: (stats) => {
        console.log('✅ [StatsPage] Stats recibidas:', stats);
        this.stats = stats || {};
        this.loading = false;
        console.log('📉 [StatsPage] loading =', this.loading);
      },
      error: (err) => {
        console.error('❌ [StatsPage] Error al cargar stats:', err);
        this.stats = {};
        this.loading = false;
      }
    });
  }

  // ================== CARGA DE MIEMBROS ==================

  loadMembers() {
    if (!this.isCoordinator || !this.selectedAreaId) {
      console.log(
        'ℹ️ [StatsPage] No se cargan miembros (isCoordinator =',
        this.isCoordinator,
        ', selectedAreaId =',
        this.selectedAreaId,
        ')'
      );
      return;
    }

    console.log('📡 [StatsPage] GET /areas/' + this.selectedAreaId + '/members');
    this.api.getAreaMembers(this.selectedAreaId).subscribe({
      next: (members) => {
        console.log('👥 [StatsPage] Miembros recibidos:', members);
        this.members = members;
      },
      error: (err) => {
        console.error('❌ [StatsPage] Error al cargar miembros:', err);
        this.members = [];
      }
    });
  }

  // ================== GETTERS PARA LA VISTA ==================

  get hasStats(): boolean {
    const result = !!this.stats && Object.keys(this.stats).length > 0;
    console.log('🔎 [StatsPage] hasStats =', result, 'stats =', this.stats);
    return result;
  }

  get total(): number {
    return this.stats?.total || 0;
  }

  get nuevas(): number {
    return this.stats?.nuevas ?? this.stats?.NUEVAS ?? 0;
  }

  get enProgreso(): number {
    return this.stats?.en_progreso ?? this.stats?.EN_PROGRESO ?? 0;
  }

  get completadas(): number {
    return this.stats?.completadas ?? this.stats?.COMPLETADAS ?? 0;
  }

  get bloqueadas(): number {
    return this.stats?.bloqueadas ?? this.stats?.BLOQUEADAS ?? 0;
  }

  get canceladas(): number {
    return this.stats?.canceladas ?? this.stats?.CANCELADAS ?? 0;
  }

  get completionPercent(): number {
    const t = this.total;
    if (!t) return 0;
    return Math.round((this.completadas * 100) / t);
  }

  get statusDistribution() {
    return [
      { label: 'Nuevas',      count: this.nuevas },
      { label: 'En progreso', count: this.enProgreso },
      { label: 'Bloqueadas',  count: this.bloqueadas },
      { label: 'Completadas', count: this.completadas },
      { label: 'Canceladas',  count: this.canceladas }
    ];
  }

  getPercent(count: number): number {
    const t = this.total;
    if (!t) return 0;
    return Math.round((count * 100) / t);
  }

  get seguimientoPercent(): number | null {
    const porTipo = this.stats?.por_tipo;
    if (!porTipo) return null;
    const simple = porTipo.SIMPLE || 0;
    const seg = porTipo.SEGUIMIENTO || 0;
    const total = simple + seg;
    if (!total) return null;
    return Math.round((seg * 100) / total);
  }

  get latestComments(): any[] {
    const arr = this.stats?.last_comments;
    return Array.isArray(arr) ? arr : [];
  }

  formatDate(date: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  refresh(event: any) {
    console.log('🔄 [StatsPage] Refrescando datos...');
    this.loadStats();
    this.loadMembers();
    setTimeout(() => {
      console.log('✅ [StatsPage] Refresh completado');
      event.target.complete();
    }, 800);
  }
}
