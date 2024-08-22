import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/auth.service';
import { ScreenService } from '../../services/screen.service';
import { Globals } from '../../globals';
import { SidenavService } from '../../services/sidenav.service';
import { MenuService } from '../../services/menu.service';
import { RestaurantService } from '../../services/restaurant.service';
import { QrMenuService } from '../../services/qrmenu.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  myForm: FormGroup;
  codeForm: FormGroup;
  matcher = new MyErrorStateMatcher();
  hideConfirm: boolean = true;
  hide: boolean = true;
  disabled = false;

  loading: boolean = false;
  registerState = 0; // 0 - enter email, password, 1 - enter confirmation code

  constructor(
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    public screen: ScreenService,
    private globals: Globals,
    private router: Router,
    private sidenav: SidenavService,
    private menusService: MenuService,
    private restService: RestaurantService,
    private qrMenusService: QrMenuService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.myForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: [''],
      },
      { validator: this.checkPasswords }
    );

    this.codeForm = this.formBuilder.group({
      code: ['', [Validators.required]],
    });
  }

  checkPasswords(group: FormGroup) {
    let pass = group.controls.password.value;
    let confirmPass = group.controls.confirmPassword.value;

    if (pass === confirmPass) {
      group.controls.confirmPassword.setErrors(null);

      return null;
    } else {
      group.controls.confirmPassword.setErrors({ notSame: true });
      return { notSame: true };
    }
  }

  public ngOnInit(): void {}

  getEmailErrorMessage() {
    if (this.myForm.controls['email'].hasError('required')) {
      return 'You must enter a value';
    }

    return this.myForm.controls['email'].hasError('email')
      ? 'Not a valid email'
      : '';
  }

  back() {
    this.registerState = 0;
    this.codeForm.controls.code.setValue('');
  }

  sendCode() {
    this.myForm.markAllAsTouched();
    if (!this.myForm.valid) {
      return;
    }
    this.loading = true;
    this.auth.sendCode(this.myForm.controls.email.value).subscribe(
      (r) => {
        this.loading = false;
        this.registerState = 1;
      },
      (error) => {
        // this.notify.error(error.error);
      }
    );
  }

  register() {
    this.codeForm.markAllAsTouched();
    if (!this.codeForm.valid) {
      return;
    }

    this.disabled = true;
    let email = this.myForm.controls.email.value;
    let password = this.myForm.controls.password.value;
    let code = this.codeForm.controls.code.value;
    this.auth.register(email, password, code).subscribe(
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
        // this.notify.error(error.error);
        this.disabled = false;
      }
    );
  }
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent?.dirty);
    const invalidParent = !!(
      control &&
      control.parent &&
      control.parent.invalid &&
      control.parent.dirty
    );

    return invalidCtrl || invalidParent;
  }
}
