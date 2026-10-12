import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'plan', pathMatch: 'full' },
  {
    path: 'plan',
    loadComponent: () => import('./tabs/plan/plan.component').then(m => m.PlanComponent)
  },
  {
    path: 'my-trips',
    loadComponent: () => import('./tabs/my-trips/my-trips.component').then(m => m.MyTripsComponent)
  },
  {
    path: 'spots',
    loadComponent: () => import('./tabs/spots/spots.component').then(m => m.SpotsComponent)
  },
  {
    path: 'guides',
    loadComponent: () => import('./tabs/guides/guides.component').then(m => m.GuidesComponent)
  },
  {
    path: 'budget',
    loadComponent: () => import('./tabs/budget/budget.component').then(m => m.BudgetComponent)
  },
  { path: '**', redirectTo: 'plan' }
];
