import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { GoogleCallbackComponent } from './features/auth/google-callback/google-callback.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SubjectsComponent } from './features/subjects/subjects.component';
import { HistoryComponent } from './features/history/history.component';
import { ProfileComponent } from './features/profile/profile.component';
import { AnalyticsComponent } from './features/analytics/analytics.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Guest Routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'auth/google/callback',
    component: GoogleCallbackComponent,
    canActivate: [guestGuard],
  },

  
  // Authenticated Layout Routes
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'subjects',
        component: SubjectsComponent,
        data: { title: 'Subjects' },
      },
      {
        path: 'history',
        component: HistoryComponent,
        data: { title: 'Attendance Logs' },
      },
      {
        path: 'analytics',
        component: AnalyticsComponent,
        data: { title: 'Attendance Analytics' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: { title: 'Profile Settings' },
      },
    ],
  },


  // Fallback Catch-All Redirect
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

