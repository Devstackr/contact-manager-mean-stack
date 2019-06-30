import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/models/user.model';
import { WebReqService } from 'src/app/shared/services/web-req.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-details-page',
  templateUrl: './user-details-page.component.html',
  styleUrls: ['./user-details-page.component.scss']
})
export class UserDetailsPageComponent implements OnInit {

  user: User = new User();

  constructor(private webService: WebReqService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.user = this.authService.getUserDetails();

    if (!this.authService.isLoggedIn()) {
      // the user isn't logged in
      this.router.navigateByUrl("/login");
    }
  }

  saveUserDetails(userDetails: User) {
    console.log("Saving user details...");
    console.log(userDetails);
    console.log("User Id:", this.user._id);
    this.webService.patch(`/users/${this.user._id}`, userDetails).subscribe(() => {
      console.log("User details have been updated");
      this.authService.setUserDetails(userDetails.name, userDetails.email);
    })
  }

  logout() {
    this.authService.logout();
  }

}
