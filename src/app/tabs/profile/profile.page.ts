import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: `./profile.page.html`,
  styleUrls: [`./profile.page.css`]
})
export class ProfilePage {
  userName: string = '';
  userEmail: string = '';
  isCoordinator: boolean = false;
  areasCount: number = 0;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userName = user.name;
      this.userEmail = user.email;
    }

    this.api.me().subscribe({
      next: (user) => {
        this.isCoordinator = !!(user.areas && user.areas.length > 0);
        this.areasCount = user.areas?.length || 0;
      }
    });
  }

  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}