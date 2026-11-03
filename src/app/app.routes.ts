import { Routes } from '@angular/router';
import { authGuard, authChildGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () =>
      import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'map',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/map/pages/map/map.page').then((m) => m.MapPage),
      },
      {
        path: 'my-places',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/places/pages/my-places/my-places.page').then(
            (m) => m.LocationsPage,
          ),
      },
      {
        path: 'points-of-interest',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/places/pages/points-of-interest/points-of-interest.page').then(
            (m) => m.PointsOfInterestPage,
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/pages/profile/profile.page').then(
            (m) => m.ProfilePage,
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
