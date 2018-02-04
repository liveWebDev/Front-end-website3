import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard }            from './auth-guard.service';

import { MainComponent }   from './main/main.component';

const routes: Routes = [
  { path: '', loadChildren: './auth/auth.module#AuthModule', },
  { path: 'register', loadChildren: './auth/auth.module#AuthModule'},
  { path: 'reset', loadChildren: './auth/auth.module#AuthModule'},
  { path: 'main', loadChildren: './main/main.module#MainModule', canActivate: [AuthGuard]},
  // otherwise redirect to home
  { path: '**', redirectTo: '' }

];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
