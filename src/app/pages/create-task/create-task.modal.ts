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
    areaId: null as number | null,
    assignedToUserId: null as number | null,  
    title: '',
    description: '',
    taskType: 'GENERAL',
    urgency: 'MEDIA',
    dueAt: ''
  };

  members: any[] = [];     
  loadingMembers = false;    
  isSaving = false;
  today = new Date().toISOString();

  constructor(
    private api: ApiService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  // Cuando cambia el área
  onAreaChange(ev: any) {
    const areaId = ev.detail.value;
    this.task.areaId = areaId;
    this.task.assignedToUserId = null;
    this.members = [];

    if (!areaId) return;

    this.loadingMembers = true;
    this.api.getAreaMembers(areaId).subscribe({
      next: (members) => {
        console.log('👥 Miembros del área', members);
        this.members = members;
        this.loadingMembers = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar miembros del área', err);
        this.loadingMembers = false;
        this.showToast('❌ Error al cargar miembros del área');
      }
    });
  }

  async saveTask() {
    if (!this.task.areaId || !this.task.title) {
      this.showToast('⚠️ Debes completar al menos el área y el título');
      return;
    }


    const payload: any = {
      areaId: this.task.areaId,
      title: this.task.title,
      description: this.task.description,
      taskType: this.task.taskType,
      urgency: this.task.urgency,
      dueAt: this.task.dueAt || null
    };

    if (this.task.assignedToUserId) {
      payload.assignedToUserId = this.task.assignedToUserId;
    }

    this.isSaving = true;
    this.api.createTask(payload).subscribe({
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
