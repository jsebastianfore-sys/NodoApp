import { Routes } from '@angular/router';
import { authGuard, authChildGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'map',
        canActivate: [authGuard],
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      },
      {
        path: 'locations',
        canActivate: [authGuard],
        loadComponent: () => import('./locations/locations.page').then(m => m.LocationsPage)
      },
      {
        path: 'places',
        canActivate: [authGuard],
        loadComponent: () => import('./places/places.page').then(m => m.PlacesPage)
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
