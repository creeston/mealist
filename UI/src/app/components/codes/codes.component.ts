import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { EditMealsComponent } from '../edit-meals/edit-meals.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { QrMenu, QrMenuService } from '../../services/qrmenu.service';
import { RestaurantService } from '../../services/restaurant.service';
import { Globals } from '../../globals';
import { ScreenService } from '../../services/screen.service';
import { MenuService } from '../../services/menu.service';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { environment } from '../../../environments/environment';
import { Restaurant } from '../../api/model/models';

@Component({
  selector: 'app-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['./codes.component.css'],
})
export class CodesComponent implements OnInit {
  public dataLoaded = false;
  public loading = false;
  public editMealsLoading = false;
  public qrMenus: QrMenu[] = [];
  public rests: Restaurant[] = [];

  constructor(
    public globals: Globals,
    public dialog: MatDialog,
    public screen: ScreenService,
    private router: Router,
    private cookie: CookieService,
    private service: QrMenuService,
    private menuService: MenuService,
    private restService: RestaurantService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    let jwt = this.cookie.get('ApiJwt');
    if (jwt) {
      this.restService.listRestaurants()?.subscribe((rests) => {
        this.rests = rests as Restaurant[];
        this.refresh();
      });
    } else {
      this.router.navigate(['/login']);
      return;
    }
  }

  @ViewChild('imgBuffer')
  imageElement!: ElementRef;
  imgNativeElement: any = undefined;

  ngAfterViewInit(): void {}

  forceRefresh() {
    this.service.clearCache();
    this.refresh();
  }

  silentRefresh() {
    this.service.list()?.subscribe((data: any) => {
      this.qrMenus = data;
      this.qrMenus.forEach((menu: QrMenu) => {
        this.rests.forEach((r) => {
          if ('TODO' == menu.restaurantId) {
            menu.restaurant = r;
          }
        });
      });
    });
  }

  refresh() {
    this.dataLoaded = false;
    this.service.list()?.subscribe((data: any) => {
      this.qrMenus = data;
      this.dataLoaded = true;
      this.qrMenus.forEach((menu: QrMenu) => {
        this.rests.forEach((r) => {
          if ('TODO' == menu.restaurantId) {
            menu.restaurant = r;
          }
        });
      });
    });
  }

  editMeals(menu: QrMenu) {
    this.editMealsLoading = true;
    let menuItems = menu.menuItems;
    let menuIds = menuItems.map((i) => i.menuId).join(',');
    this.menuService.listMeals(menuIds).subscribe(
      (r: any) => {
        let menuMeals = [];
        for (let i = 0; i < menuItems.length; i++) {
          let menuItem = menuItems[i];
          let menuId = menuItem.menuId;
          let menuName = menuItem.title;
          menuMeals.push({
            menuName: menuName,
            menuId: menuId,
            meals: r[i],
            id: i,
          });
        }

        this.editMealsLoading = false;
        this.dialog
          .open(EditMealsComponent, {
            width: Math.min(this.screen.width + 10, 700) + 'px',
            height: Math.min(this.screen.height, 950) + 'px',
            data: { menuMeals, menu },
          })
          .afterClosed()
          .subscribe((r) => {
            if (r) {
              menu.stopLists = r;
              this.translate
                .get('codes.stop_list_updated')
                .subscribe((text) => {
                  this.snackBar.open(text, '', {
                    duration: 2 * 1000,
                  });
                });
            }
          });
      },
      (e: any) => {
        // this.notify.error(e);
        this.editMealsLoading = false;
      }
    );
  }

  edit(menu: QrMenu) {
    this.router.navigate(['codes', menu.id]);
  }

  createCode() {
    this.router.navigate(['code-create']);
  }

  deleteCode(code: QrMenu) {
    this.translate.get('codes.delete_confirmation').subscribe((text) => {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: Math.min(this.screen.width, 450) + 'px',
        panelClass: 'mat-dialog-confirmation-container',
        data: { message: text + ' "' + code.name + '"?' },
      });

      dialogRef.componentInstance.callback.subscribe((r) => {
        this.service.delete(code.id).subscribe(
          (r: any) => {
            const index = this.qrMenus.indexOf(code, 0);
            this.qrMenus.splice(index, 1);
            this.silentRefresh();
            dialogRef.componentInstance.close();
          },
          (error: any) => {
            // this.notify.error(JSON.stringify(error));
          }
        );
      });
    });
  }

  getMenuPublicUrl(menu: QrMenu) {
    return environment.selfUrl + '/menu/' + menu.urlSuffix;
  }

  getMenuPreviewUrl(menu: QrMenu) {
    return `https://qrmenuapistorage.blob.core.windows.net/preview/${
      menu.urlSuffix
    }.jpg?ts=${new Date().getTime()}`;
  }

  openQrMenu(menu: QrMenu) {
    let url = this.getMenuPublicUrl(menu);
    window.open(url, '_blank');
  }
}
