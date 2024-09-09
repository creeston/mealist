import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/auth.service';
import { ScreenService } from '../../services/screen.service';
import { Globals } from '../../globals';
import { SidenavService } from '../../services/sidenav.service';
import { MenuService } from '../../services/menu.service';
import { RestaurantService } from '../../services/restaurant.service';
import { QrMenuService } from '../../services/qrmenu.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export class LogInComponent implements OnInit {
  myForm: FormGroup;
  disabled: boolean = false;
  hide: boolean = true;
  triedToSend = false;

  constructor(
    private auth: AuthenticationService,
    public screen: ScreenService,
    private formBuilder: FormBuilder,
    private router: Router,
    private globals: Globals,
    private sidenav: SidenavService,
    private menusService: MenuService,
    private restService: RestaurantService,
    private qrMenusService: QrMenuService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.myForm = this.formBuilder.group({
      email: ['', []],
      password: ['', []],
    });
  }

  ngOnInit(): void {}

  signIn(): void {
    this.triedToSend = true;
    let valid = true;
    if (!this.myForm.controls.email.value) {
      this.myForm.controls.email.setErrors({ empty: true });
      valid = false;
    }

    if (!this.myForm.controls.password.value) {
      this.myForm.controls.password.setErrors({ empty: true });
      valid = false;
    }

    if (!valid) {
      return;
    }

    this.disabled = true;
    this.auth
      .signIn(
        this.myForm.controls.email.value,
        this.myForm.controls.password.value
      )
      .subscribe(
        (token: string) => {
          // this.cookie.set('ApiJwt', token);
          this.globals.isLogged = true;
          this.auth.getUserProfile(token).subscribe((r) => {
            this.menusService.listMenus();
            this.restService.listRestaurants();
            this.qrMenusService.list();
            this.router.navigate(['menus']);
            this.sidenav.open();
          });
        },
        (error) => {
          // this.notifier.error(error.error);
          this.disabled = false;
        }
      );
  }

  resetPassword() {
    this.router.navigate(['reset']);
  }
}
