
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css']
})
export class LoginPage {
  email = '';
  loading = false;
  errorMessage = '';

  constructor(
    private api: ApiService, 
    private router: Router
  ) {
    console.log('✅ LoginPage constructor ejecutado');
  }

  ngOnInit() {
    // Limpiar cualquier sesión previa
    this.api.clearToken();
  }

  login() {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Por favor ingresa un email válido';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    console.log('🔐 Iniciando login con:', this.email);

    this.api.login(this.email).subscribe({
      next: (res) => {
        console.log('✅ Login exitoso:', res);
        this.api.setToken(res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        // Obtener datos completos del usuario
        this.api.me().subscribe({
          next: (user) => {
            console.log('✅ Usuario completo:', user);
            
            // Redirigir a tabs (funciona para coordinadores y miembros)
            console.log('🚀 Navegando a /tabs');
            this.router.navigateByUrl('/tabs');
            
            this.loading = false;
          },
          error: (err) => {
            console.error('❌ Error en api.me():', err);
            this.errorMessage = 'Error al obtener datos del usuario';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
        this.errorMessage = err.error?.message || 'Error al iniciar sesión. Verifica tu email.';
        this.loading = false;
      }
    });
  }
}