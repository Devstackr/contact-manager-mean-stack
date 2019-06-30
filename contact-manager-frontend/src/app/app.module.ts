import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainLayoutComponent } from './pages/main-layout/main-layout.component';
import { ContactsPageComponent } from './pages/contacts-page/contacts-page.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { LoginPageComponent } from './pages/auth-pages/login-page/login-page.component';
import { SignupPageComponent } from './pages/auth-pages/signup-page/signup-page.component';
import { WebReqInterceptor } from './shared/web-req.interceptor';
import { UserDetailsPageComponent } from './pages/user-details-page/user-details-page.component';
import { UserDetailsComponent } from './user-details/user-details.component';

@NgModule({
  declarations: [
    AppComponent,
    MainLayoutComponent,
    ContactsPageComponent,
    ContactFormComponent,
    LoginPageComponent,
    SignupPageComponent,
    UserDetailsPageComponent,
    UserDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: WebReqInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
