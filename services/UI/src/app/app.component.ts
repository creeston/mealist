import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Globals } from './globals';
import { AuthenticationService } from './services/auth.service';
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
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screen.set(window.innerWidth, window.innerHeight);
  }

  ngOnInit() {
    let jwt = 'JWT';
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

  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.sidenav);
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
}
