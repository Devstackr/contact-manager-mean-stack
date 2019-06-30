import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, empty, throwError, Subject } from 'rxjs';
import { AuthService } from './services/auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  refreshingAccessToken: boolean;
  accessTokenRefreshed: Subject<any> = new Subject();

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // add access token to the request
    request = this.addAuthHeader(request);

    // call next() and handle the response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);

        if (error.status === 401 && request.url.endsWith('/users/me/access-token')) {
          // then this means that the refresh token has expired
          console.log("refresh token expired");
          this.refreshingAccessToken = false;
          this.authService.logout();
          return empty();
        }
        
        if (error.status == 401) {
          // 401 error so we are unauthorized

          // Refresh the Access Token
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((err: any) => {
              console.log("catching error");
              console.log(err);
              this.refreshingAccessToken = false;
              this.authService.logout();
              return empty();
            })
          )
        }

        return throwError(error);
      })
    )
  }


  refreshAccessToken() {
    if (this.refreshingAccessToken) {
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          // this code will run when the access token has been refreshed
          observer.next();
          observer.complete();
        })
      })
    } else {
      this.refreshingAccessToken = true;
      return this.authService.getNewAccessToken().pipe(
        tap(() => {
          console.log("Access Token Refreshed");
          this.refreshingAccessToken = false;
          this.accessTokenRefreshed.next();
        })
      )
    }
  }
  
  
  addAuthHeader(request: HttpRequest<any>) {
    // get the access token
    const token = this.authService.getAccessToken();

    if (token) {
      // append the access token to the request header
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      })
    }

    return request;
  }
}
