import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/models/user.model';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss', '../auth-pages-styles.scss']
})
export class LoginPageComponent implements OnInit {

  user: User = new User();

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onFormSubmit(form: NgForm) {
    console.log(form);
    if (form.valid) {
      this.authService.login(form.value.email, form.value.password).subscribe((res: HttpResponse<any>) => {
        console.log(res);
        this.router.navigateByUrl('/');
      })
    }
  }

}
