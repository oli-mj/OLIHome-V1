import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule) },
  { path: 'main', canActivate: [authGuard], loadChildren: () => import('./main/main.module').then(m => m.MainPageModule) },
  { path: 'profile-settings', canActivate: [authGuard], loadChildren: () => import('./profile-settings/profile-settings.module').then(m => m.ProfileSettingsPageModule) },
  { path: 'about-us', canActivate: [authGuard], loadChildren: () => import('./about-us/about-us.module').then(m => m.AboutUsPageModule) },
  { path: 'terms-and-conditions', canActivate: [authGuard], loadChildren: () => import('./terms-and-conditions/terms-and-conditions.module').then(m => m.TermsAndConditionsPageModule) },
  { path: 'data-privacy-policy', canActivate: [authGuard], loadChildren: () => import('./data-privacy-policy/data-privacy-policy.module').then(m => m.DataPrivacyPolicyPageModule) },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
