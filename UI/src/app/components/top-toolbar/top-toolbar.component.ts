import { Component, Input } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Globals } from '../../globals';
import { Router } from '@angular/router';
import { ScreenService } from '../../services/screen.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ContactUsDialog } from '../contact-us/contact-us';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-top-toolbar',
  templateUrl: './top-toolbar.component.html',
  styleUrl: './top-toolbar.component.scss',
})
export class TopToolbarComponent {
  @Input() sidenav!: MatDrawer;

  supportedLanguges = ['ru', 'be'];
  languageMapping = { ru: 'рус', be: 'бел' };
  selectedLanguage = this.supportedLanguges[0];

  constructor(
    public globals: Globals,
    public router: Router,
    public screen: ScreenService,
    public translate: TranslateService,
    private location: Location,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cookie: CookieService
  ) {
    translate.setDefaultLang(this.selectedLanguage);
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  back() {
    this.location.back();
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

  logout() {
    this.globals.isLogged = false;
    this.globals.email = '';
    this.cookie.delete('ApiJwt');
    // this.router.navigate(['/login']);
    if (this.sidenav.opened) {
      this.toggleSidenav();
    }
  }

  selectLanguage(language: string) {
    this.translate.use(language);
    this.selectedLanguage = language;
    this.cookie.set('LOCALE', this.selectedLanguage);
  }
}
