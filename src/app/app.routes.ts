import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'map',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
      },
      {
        path: 'locations',
        loadComponent: () => import('./locations/locations.page').then(m => m.LocationsPage)
      },
      {
        path: 'places',
        loadComponent: () => import('./places/places.page').then(m => m.PlacesPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full'
      }
    ]
  }
];
