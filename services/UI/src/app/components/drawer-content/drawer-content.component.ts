import { Component, Input } from '@angular/core';
import { Globals } from '../../globals';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactUsDialog } from '../contact-us/contact-us';

@Component({
  selector: 'app-drawer-content',
  templateUrl: './drawer-content.component.html',
  styleUrl: './drawer-content.component.scss',
})
export class DrawerContentComponent {
  @Input() sidenav!: MatDrawer;

  constructor(
    public globals: Globals,
    public router: Router,
    private translate: TranslateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  goTo(path: string) {
    this.router.navigate([path]);
    if (this.sidenav.mode == 'over') {
      this.toggleSidenav();
    }
  }

  toggleSidenav() {
    this.sidenav.toggle();
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
    if (this.sidenav.opened) {
      this.toggleSidenav();
    }
  }
}
