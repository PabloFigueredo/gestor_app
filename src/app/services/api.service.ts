import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interfaces basadas en tu base de datos
export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Area {
  id: number;
  company_id: number;
  name: string;
  coordinator_id: number;
  created_at: string;
}

export interface Task {
  id: number;
  area_id: number;
  assigned_to_user_id: number | null;
  assigned_by_user_id: number;
  title: string;
  description: string | null;
  task_type: 'SIMPLE' | 'SEGUIMIENTO'; // 👈 ANTES: SIMPLE | COMPLEJA
  urgency: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'; // 👈 añadimos CRITICA
  status: 'NUEVA' | 'EN_PROGRESO' | 'EN_ESPERA' | 'BLOQUEADA' | 'COMPLETADA' | 'CANCELADA'; // 👈 añadimos EN_ESPERA y BLOQUEADA
  due_at: string | null;
  created_at: string;
  updated_at: string;
}


export interface TaskComment {
  id: number;
  task_id: number;
  author_id: number;
  body: string;
  created_at: string;
  author_name?: string; // 👈 coincide con el SELECT
}


export interface TaskSubtask {
  id: number;
  task_id: number;
  title: string;
  status: 'NUEVA' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
  due_at: string | null;
  position: number;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token');
    console.log('🔧 ApiService inicializado');
    console.log('📍 Base URL:', this.baseUrl);
  }

  private get headers() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
      })
    };
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
    console.log('🔑 Token guardado');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🗑️ Token eliminado');
  }

  // ==================== AUTH ====================
  login(email: string): Observable<{ token: string; user: User }> {
    console.log('📡 POST /auth/login', { email });
    return this.http.post<{ token: string; user: User }>(
      `${this.baseUrl}/auth/login`, 
      { email }
    );
  }

  me(): Observable<User & { role?: string; areas?: Area[] }> {
    console.log('📡 GET /me');
    return this.http.get<User & { role?: string; areas?: Area[] }>(
      `${this.baseUrl}/me`, 
      this.headers
    );
  }

  // ==================== TASKS ====================
  getMyTasks(): Observable<Task[]> {
    console.log('📡 GET /tasks/my');
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/my`, this.headers);
  }

  getTask(id: number): Observable<Task> {
    console.log('📡 GET /tasks/' + id);
    return this.http.get<Task>(`${this.baseUrl}/tasks/${id}`, this.headers);
  }

createTask(task: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/tasks`, task, this.headers);
}


  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    console.log('📡 PUT /tasks/' + id, task);
    return this.http.put<Task>(`${this.baseUrl}/tasks/${id}`, task, this.headers);
  }

  deleteTask(id: number): Observable<void> {
    console.log('📡 DELETE /tasks/' + id);
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`, this.headers);
  }

  updateStatus(id: number, status: string, note = ''): Observable<any> {
    console.log('📡 PATCH /tasks/' + id + '/status', { status, note });
    return this.http.patch(
      `${this.baseUrl}/tasks/${id}/status`, 
      { status, note }, 
      this.headers
    );
  }

  // ==================== COMMENTS ====================
  getComments(taskId: number): Observable<TaskComment[]> {
    console.log('📡 GET /tasks/' + taskId + '/comments');
    return this.http.get<TaskComment[]>(
      `${this.baseUrl}/tasks/${taskId}/comments`, 
      this.headers
    );
  }

  addComment(taskId: number, body: string): Observable<TaskComment> {
    console.log('📡 POST /tasks/' + taskId + '/comments', { body });
    return this.http.post<TaskComment>(
      `${this.baseUrl}/tasks/${taskId}/comments`, 
      { body }, 
      this.headers
    );
  }

  // ==================== SUBTASKS ====================
  getSubtasks(taskId: number): Observable<TaskSubtask[]> {
    console.log('📡 GET /tasks/' + taskId + '/subtasks');
    return this.http.get<TaskSubtask[]>(
      `${this.baseUrl}/tasks/${taskId}/subtasks`, 
      this.headers
    );
  }

  createSubtask(taskId: number, subtask: Partial<TaskSubtask>): Observable<TaskSubtask> {
    console.log('📡 POST /tasks/' + taskId + '/subtasks', subtask);
    return this.http.post<TaskSubtask>(
      `${this.baseUrl}/tasks/${taskId}/subtasks`, 
      subtask, 
      this.headers
    );
  }

  updateSubtask(taskId: number, subtaskId: number, subtask: Partial<TaskSubtask>): Observable<TaskSubtask> {
    console.log('📡 PUT /tasks/' + taskId + '/subtasks/' + subtaskId, subtask);
    return this.http.put<TaskSubtask>(
      `${this.baseUrl}/tasks/${taskId}/subtasks/${subtaskId}`, 
      subtask, 
      this.headers
    );
  }

  deleteSubtask(taskId: number, subtaskId: number): Observable<void> {
    console.log('📡 DELETE /tasks/' + taskId + '/subtasks/' + subtaskId);
    return this.http.delete<void>(
      `${this.baseUrl}/tasks/${taskId}/subtasks/${subtaskId}`, 
      this.headers
    );
  }

  // ==================== AREAS ====================
  getMyAreas(): Observable<Area[]> {
    console.log('📡 GET /areas/mine');
    return this.http.get<Area[]>(`${this.baseUrl}/areas/mine`, this.headers);
  }

  getArea(areaId: number): Observable<Area> {
    console.log('📡 GET /areas/' + areaId);
    return this.http.get<Area>(`${this.baseUrl}/areas/${areaId}`, this.headers);
  }

  getAreaMembers(areaId: number): Observable<any[]> {
    console.log('📡 GET /areas/' + areaId + '/members');
    return this.http.get<any[]>(
      `${this.baseUrl}/areas/${areaId}/members`, 
      this.headers
    );
  }

  getStats(areaId: number): Observable<any> {
    console.log('📡 GET /areas/' + areaId + '/stats');
    return this.http.get(`${this.baseUrl}/areas/${areaId}/stats`, this.headers);
  }

  // ==================== TASK HISTORY ====================
  getTaskHistory(taskId: number): Observable<any[]> {
    console.log('📡 GET /tasks/' + taskId + '/history');
    return this.http.get<any[]>(
      `${this.baseUrl}/tasks/${taskId}/history`, 
      this.headers
    );
  }
}