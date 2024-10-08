import { Component, Input, OnInit } from '@angular/core';
import { ScreenService } from '../../services/screen.service';
import { QrMenu } from '../../api';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { environment } from '../../../environments/environment';
import { EditMealsComponent } from '../edit-meals/edit-meals.component';
import { Router } from '@angular/router';
import { QrMenuService } from '../../services/qrmenu.service';

@Component({
  selector: 'app-qrmenu-card',
  templateUrl: './qrmenu-card.component.html',
  styleUrls: ['./qrmenu-card.component.scss'],
})
export class QrmenuCardComponent implements OnInit {
  editMealsLoading = false;

  @Input({ required: true }) qrmenu!: QrMenu;

  constructor(
    public screen: ScreenService,
    public translate: TranslateService,
    public dialog: MatDialog,
    public router: Router,
    public service: QrMenuService
  ) {}

  ngOnInit(): void {}

  deleteCode(code: QrMenu) {
    this.translate
      .get('codes.delete_confirmation')
      .subscribe((text: string) => {
        const dialogRef = this.dialog.open(ConfirmationDialog, {
          width: Math.min(this.screen.width, 450) + 'px',
          panelClass: 'mat-dialog-confirmation-container',
          data: { message: text + ' "' + code.name + '"?' },
        });

        dialogRef.componentInstance.callback.subscribe((r) => {
          this.service.delete(code.id).then(
            (r: any) => {
              dialogRef.componentInstance.close();
            },
            (error: any) => {
              console.log(error);
              dialogRef.componentInstance.close();
            }
          );
        });
      });
  }

  editMeals(menu: QrMenu) {
    this.editMealsLoading = true;
    if (!menu.menus) {
      return;
    }

    let menuItems = menu.menus;
    let menuMeals: any[] = [];
    // for (let item of menuItems) {
    //   const menu = item.menu;
    //   if (!menu || !menu.pages) {
    //     continue;
    //   }

    //   for (let page of menu.pages) {
    //     const markup = page.markup;
    //     if (!markup) {
    //       continue;
    //     }

    //     const pageMeals = markup.map((line) => {
    //       return line.text;
    //     });

    //     menuMeals.push({
    //       menuName: menu.name,
    //       menuId: menu.id,
    //       meals: pageMeals,
    //       id: menuMeals.length,
    //     });
    //   }
    // }

    this.editMealsLoading = false;
    this.dialog
      .open(EditMealsComponent, {
        width: Math.min(this.screen.width + 10, 700) + 'px',
        height: Math.min(this.screen.height, 950) + 'px',
        data: { menuMeals, menu },
      })
      .afterClosed()
      .subscribe((r: any) => {
        if (r) {
          // menu.stopList = r;
          this.translate
            .get('codes.stop_list_updated')
            .subscribe((text: string) => {
              // this.snackBar.open(text, '', {
              //   duration: 2 * 1000,
              // });
            });
        }
      });
  }

  edit(menu: QrMenu) {
    this.router.navigate(['qrmenus', menu.id]);
  }

  getMenuPublicUrl(menu: QrMenu) {
    return `${environment.qrMenuUrl}/${menu.urlSuffix}`;
  }

  getMenuPreviewUrl(menu: QrMenu) {
    return `${environment.storageUrl}/mealist-public/QrMenus/${menu.urlSuffix}/loadingPlaceholder.png`;
  }

  openQrMenu(menu: QrMenu) {
    let url = this.getMenuPublicUrl(menu);
    window.open(url, '_blank');
  }

  downloadQRCode(menu: QrMenu) {}
}
