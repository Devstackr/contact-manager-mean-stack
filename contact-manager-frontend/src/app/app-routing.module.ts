import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLayoutComponent } from './pages/main-layout/main-layout.component';
import { ContactsPageComponent } from './pages/contacts-page/contacts-page.component';
import { LoginPageComponent } from './pages/auth-pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/auth-pages/signup-page/signup-page.component';
import { UserDetailsPageComponent } from './pages/user-details-page/user-details-page.component';

const routes: Routes = [
  { path: '', component: MainLayoutComponent, children: [
    { path: '', component: ContactsPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'signup', component: SignupPageComponent },
    { path: 'user-details', component: UserDetailsPageComponent },
  ] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
