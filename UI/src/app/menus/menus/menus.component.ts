import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Menu } from '../../api';
import { Globals } from '../../globals';
import { MenuService } from '../../services/menu.service';
import { ScreenService } from '../../services/screen.service';
import { SidenavService } from '../../services/sidenav.service';
import { MenuFormDialog } from '../menu-form/menu-form.component';

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
    private service: MenuService,
    private sidenavService: SidenavService
  ) { }

  ngOnInit(): void {
    this.sidenavService.openIfNeeded();
    this.refresh();
  }

  onMenuDeleted(menu: Menu) {
    const index = this.menus.indexOf(menu, 0);
    this.menus.splice(index, 1);
    this.silentRefresh();
  }

  forceRefresh() {
    this.refresh();
  }

  async silentRefresh() {
    this.menus = await this.service.listMenus();
  }

  async refresh() {
    this.dataLoaded = false;
    await this.silentRefresh();
    this.dataLoaded = true;
  }

  createMenu() {
    const dialogRef = this.dialog.open(MenuFormDialog, { width: '350px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.forceRefresh();
      }
    });
  }

  onDrop(event: any) {
    const dialogRef = this.dialog.open(MenuFormDialog, {
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
