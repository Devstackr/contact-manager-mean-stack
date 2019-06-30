import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss', '../auth-pages-styles.scss']
})
export class SignupPageComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  signup(userDetails: User) {
    this.authService.signup(userDetails.name, userDetails.email, userDetails.password)
      .subscribe((res: HttpResponse<any>) => {
        console.log(res);
        this.router.navigateByUrl('/');
      })
  }

}
