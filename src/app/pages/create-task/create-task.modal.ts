import { Component, Input } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './create-task.modal.html',
  styleUrls: ['./create-task.modal.css']
})
export class CreateTaskModal {
  @Input() areas: any[] = [];

  task = {
    areaId: null,
    assignedToUserId: null,
    title: '',
    description: '',
    taskType: 'GENERAL',
    urgency: 'MEDIA',
    dueAt: ''
  };

  isSaving = false;
  today = new Date().toISOString(); // 🔹 se usa en [min]="today" del ion-datetime

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  async saveTask() {
    if (!this.task.areaId || !this.task.title) {
      this.showToast('⚠️ Debes completar al menos el área y el título');
      return;
    }

    this.isSaving = true;
    this.api.createTask(this.task).subscribe({
      next: async (res) => {
        console.log('✅ Tarea creada:', res);
        this.isSaving = false;
        this.showToast('✅ Tarea creada correctamente');
        this.modalCtrl.dismiss({ refresh: true });
      },
      error: (err) => {
        console.error('❌ Error al crear tarea:', err);
        this.isSaving = false;
        this.showToast('❌ Error al crear tarea');
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}
