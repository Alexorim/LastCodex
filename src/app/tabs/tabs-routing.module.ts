import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../pages/home/home.page').then(m => m.HomePage)
      },
      {
        path: 'search',
        loadComponent: () => import('../pages/search/search.page').then(m => m.SearchPage)
      },
      {
        path: 'calendar',
        loadComponent: () => import('../pages/calendar/calendar.page').then(m => m.CalendarPage)
      },
      {
        path: 'codex',
        loadComponent: () => import('../pages/codex/codex.page').then(m => m.CodexPage)
      },
      {
        path: 'settings',
        loadComponent: () => import('../pages/settings/settings.page').then(m => m.SettingsPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  // Backward compatibility redirects
  { path: 'tabs/tab1', redirectTo: 'home', pathMatch: 'full' },
  { path: 'tabs/tab2', redirectTo: 'search', pathMatch: 'full' },
  { path: 'tabs/tab3', redirectTo: 'calendar', pathMatch: 'full' },
  { path: 'tabs', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
