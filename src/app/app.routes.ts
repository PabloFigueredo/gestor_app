// ==================== APP ROUTES CON TABS ====================
// src/app/app.routes.ts

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () => import('./tabs/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./tabs/tasks/tasks.page').then(m => m.TasksTabPage)
      },
      {
        path: 'stats',
        loadComponent: () => import('./tabs/stats/stats.page').then(m => m.StatsTabPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./tabs/profile/profile.page').then(m => m.ProfilePage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];