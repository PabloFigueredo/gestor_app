import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService, Task, TaskComment } from '../../services/api.service';

@Component({
  selector: 'app-task-detail-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './task-detail.modal.html',
  // Si no tienes CSS, deja comentado esto:
  // styleUrls: ['./task-detail.modal.css']
})
export class TaskDetailModal {
  @Input() task!: Task;

  comments: TaskComment[] = [];
  loadingComments = true;

  selectedStatus!: Task['status'];
  statusNote: string = '';
  commentText: string = '';

  savingStatus = false;
  savingComment = false;

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.selectedStatus = this.task.status;
    this.loadComments();
  }

  // 👉 Ahora Seguimiento = 'SEGUIMIENTO'
  get isSeguimiento(): boolean {
    return this.task.task_type === 'SEGUIMIENTO';
  }

  loadComments() {
    this.loadingComments = true;
    this.api.getComments(this.task.id).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loadingComments = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar comentarios', err);
        this.loadingComments = false;

        // Si el backend aún no tuviera GET /tasks/{id}/comments
        if (err.status === 404) {
          this.comments = [];
        } else {
          this.showToast('Error al cargar comentarios');
        }
      }
    });
  }

  async updateStatus() {
    if (this.selectedStatus === this.task.status && !this.statusNote.trim()) {
      this.showToast('Nada que actualizar');
      return;
    }

    this.savingStatus = true;
    this.api.updateStatus(this.task.id, this.selectedStatus, this.statusNote.trim()).subscribe({
      next: () => {
        this.task.status = this.selectedStatus;
        this.statusNote = '';
        this.savingStatus = false;
        this.showToast('Estado actualizado');

        // Si es seguimiento, recargamos comentarios porque la nota se guarda en el historial
        if (this.isSeguimiento) {
          this.loadComments();
        }
      },
      error: (err) => {
        console.error('❌ Error al actualizar estado', err);
        this.savingStatus = false;
        this.showToast('Error al actualizar estado');
      }
    });
  }

  async addComment() {
  const text = this.commentText.trim();
  if (!text) {
    this.showToast('Escribe un comentario');
    return;
  }

  this.savingComment = true;
  this.api.addComment(this.task.id, text).subscribe({
    next: () => {
      // Ya se guardó en el backend ✅
      this.commentText = '';
      this.savingComment = false;
      this.showToast('Comentario agregado');

      // ⬇️ recargamos la lista desde el backend
      this.loadComments();
    },
    error: (err) => {
      console.error('❌ Error al agregar comentario', err);
      this.savingComment = false;
      this.showToast('Error al agregar comentario');
    }
    });
  }


  dismiss() {
    this.modalCtrl.dismiss();
  }

  // cerrar devolviendo la tarea actualizada al listado
  closeWithSave() {
    this.modalCtrl.dismiss({ updated: this.task });
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

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
