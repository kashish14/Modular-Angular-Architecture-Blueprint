import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
  },
  {
    path: 'users',
    canMatch: [authGuard],
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
  },
  {
    path: 'settings',
    canMatch: [authGuard],
    loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
