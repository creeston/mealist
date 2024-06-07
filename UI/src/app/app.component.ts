import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Globals } from './globals';
import { AuthenticationService } from './services/auth.service';
import { Location } from '@angular/common';
import { MenuService } from './services/menu.service';
import { QrMenuService } from './services/qrmenu.service';
import { RestaurantService } from './services/restaurant.service';
import { SidenavService } from './services/sidenav.service';
import { ScreenService } from './services/screen.service';
import { MatSidenav } from '@angular/material/sidenav';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ContactUsDialog } from './components/contact-us/contact-us';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  supportedLanguges = ['ru', 'be'];
  languageMapping = { ru: 'рус', be: 'бел' };
  selectedLanguage = this.supportedLanguges[0];

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public globals: Globals,
    public router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthenticationService,
    private menusService: MenuService,
    private restService: RestaurantService,
    private qrMenusService: QrMenuService,
    private cookie: CookieService,
    private location: Location,
    private sidenavService: SidenavService,
    public screen: ScreenService,
    public translate: TranslateService
  ) {
    const googleLogoURL =
      'https://raw.githubusercontent.com/fireflysemantics/logo/master/Google.svg';
    this.matIconRegistry.addSvgIcon(
      'logo',
      this.domSanitizer.bypassSecurityTrustResourceUrl(googleLogoURL)
    );
    translate.setDefaultLang(this.selectedLanguage);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screen.set(window.innerWidth, window.innerHeight);
  }

  getUsersLocale(): string {
    if (
      typeof window === 'undefined' ||
      typeof window.navigator === 'undefined'
    ) {
      return this.supportedLanguges[0];
    }
    const wn = window.navigator as any;
    let lang = wn.languages ? wn.languages[0] : this.supportedLanguges[0];
    lang =
      lang || wn.language || wn.browserLanguage || (wn.userLanguage as string);
    lang = lang.substring(0, 2);
    if (this.supportedLanguges.indexOf(lang) === -1) {
      return this.supportedLanguges[0];
    } else {
      return lang;
    }
  }

  ngOnInit() {
    this.cookie.set('ApiJwt', 'JWT');
    let lang = this.cookie.get('LOCALE');
    if (lang) {
      this.translate.use(lang);
      this.selectedLanguage = lang;
    } else {
      let locale = this.getUsersLocale();
      this.selectLanguage(locale);
    }

    let jwt = this.cookie.get('ApiJwt');
    this.screen.set(window.innerWidth, window.innerHeight);
    this.globals.isLogged = Boolean(jwt);
    if (jwt) {
      this.authService.getUserProfile(jwt).subscribe((r: any) => {
        this.globals.email = r.email;
        this.globals.userId = r.userId;

        this.menusService.listMenus();
        this.restService.listRestaurants();
        this.qrMenusService.list();
      });
    }
  }

  selectLanguage(language: string) {
    this.translate.use(language);
    this.selectedLanguage = language;
    this.cookie.set('LOCALE', this.selectedLanguage);
  }

  goTo(path: string) {
    this.router.navigate([path]);
    if (this.sidenav.mode == 'over') {
      this.toggleSidenav();
    }
  }

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  logout() {
    this.globals.isLogged = false;
    this.globals.email = '';
    this.cookie.delete('ApiJwt');
    // this.router.navigate(['/login']);
    if (this.sidenav.opened) {
      this.toggleSidenav();
    }
  }

  contactUs() {
    this.translate.get('contact.we_will_contact_you').subscribe((text) => {
      const dialogRef = this.dialog.open(ContactUsDialog, {
        width: '450px',
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.snackBar.open(text, '', {
            duration: 2 * 1000,
          });
        }
      });
    });
  }

  back() {
    this.location.back();
  }
}
