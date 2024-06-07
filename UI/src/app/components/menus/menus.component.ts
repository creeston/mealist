import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material/dialog';
import { CreateMenuDialog } from '../create-menu/create-menu.component';
import { Menu, MenuService } from '../../services/menu.service';
import { Globals } from '../../globals';
import { ScreenService } from '../../services/screen.service';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css'],
})
export class MenusComponent implements OnInit {
  public dataLoaded = false;
  public loading = false;
  public menus: Menu[] = [];

  httpOptions: any;
  jwt: string = '';
  showFiller = true;

  constructor(
    public globals: Globals,
    public dialog: MatDialog,
    public screen: ScreenService,
    private cookie: CookieService,
    private service: MenuService,
    private router: Router,
    private sidenavService: SidenavService
  ) {}

  ngOnInit(): void {
    this.jwt = this.cookie.get('ApiJwt');
    if (this.jwt) {
      this.sidenavService.openIfNeeded();
      this.refresh();
    } else {
      this.router.navigate(['/login']);
      return;
    }
  }

  onMenuDeleted(menu: Menu) {
    const index = this.menus.indexOf(menu, 0);
    this.menus.splice(index, 1);
    this.silentRefresh();
  }

  forceRefresh() {
    this.service.clearCache();
    this.refresh();
  }

  silentRefresh() {
    this.service.listMenus().subscribe((r: any) => {
      this.menus = r;
      this.menus = this.menus.sort((a, b) =>
        a.creationDate > b.creationDate ? -1 : 1
      );
    });
  }

  refresh() {
    this.dataLoaded = false;
    this.service.listMenus().subscribe((r: any) => {
      this.menus = r;
      this.menus = this.menus.sort((a, b) =>
        a.creationDate > b.creationDate ? -1 : 1
      );
      this.dataLoaded = true;
    });
  }

  createMenu() {
    const dialogRef = this.dialog.open(CreateMenuDialog, { width: '350px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.forceRefresh();
      }
    });
  }

  onDrop(event: any) {
    const dialogRef = this.dialog.open(CreateMenuDialog, {
      width: '350px',
      data: event,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.forceRefresh();
      }
    });
  }
}
