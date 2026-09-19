import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy, PathLocationStrategy } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: isFileProtocol ? HashLocationStrategy : PathLocationStrategy
    }
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
