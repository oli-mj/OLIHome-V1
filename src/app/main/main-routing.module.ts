import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
      },
      {
        path: 'file-a-ticket',
        loadChildren: () => import('./file-a-ticket/file-a-ticket.module').then( m => m.FileATicketPageModule)
      },
      {
        path: 'community-living',
        loadChildren: () => import('./community-living/community-living.module').then( m => m.CommunityLivingPageModule)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
