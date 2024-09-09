import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MenuComponent } from '../menu/menu.component';
import { TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../services/menu.service';
import { ScreenService } from '../../services/screen.service';
import { Globals } from '../../globals';
import { TranslateHelperClass } from '../../services/translate-helper.service';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { Menu } from '../../api/model/menu';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-card',
  templateUrl: './menu-card.component.html',
  styleUrls: ['./menu-card.component.css'],
})
export class MenuCardComponent implements OnInit {
  @Input()
  public menu!: Menu;

  @Output()
  public loading = new EventEmitter<boolean>();

  @Output()
  public onMenuDeleted = new EventEmitter();

  Arr = Array;
  opacity = 1;
  refreshDisabled = false;
  displayMenu = false;
  currentMenuPage: number = 0;
  renderedImages: string[] = [];
  previewImageUrl: string | null = null;

  constructor(
    public dialog: MatDialog,
    public screen: ScreenService,
    private menuService: MenuService,
    public globals: Globals,
    private translate: TranslateService,
    public translateHelper: TranslateHelperClass,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.previewImageUrl =
      this.menu.pages && this.menu.pages.length > 0
        ? this.menu.pages[0].imageUrl
        : null;

    this.renderedImages = this.menu.pages!.map((page) => page.imageUrl);
  }

  async showGallery(menu: Menu) {
    if (this.displayMenu) {
      this.displayMenu = false;
      return;
    }

    this.displayMenu = true;
  }

  openPdf(menu: Menu) {
    window.open(menu.originalFileUrl, '_blank');
  }

  handlePageChange(event: PageEvent) {
    this.currentMenuPage = event.pageIndex;
  }

  getDishCount() {
    let dishCount = 0;
    if (this.menu.pages) {
      this.menu.pages.forEach((page) => {
        if (page.markup) {
          dishCount += page.markup.length;
        }
      });
    }
    return dishCount;
  }

  getStatus(status: Menu.StatusEnum) {
    if (status === 'PARSING_IN_PROGRESS') {
      return 'Разбор PDF файла';
    } else if (status === 'PARSING_COMPLETED') {
      return 'PDF файл разобран';
    } else if (status === 'PARSING_FAILED') {
      return 'Ошибка разбора PDF файла';
    } else if (status === 'OCR_IN_PROGRESS') {
      return 'OCR в процессе';
    } else if (status === 'OCR_COMPLETED') {
      return 'OCR завершен';
    } else if (status == "REVIEWED") {
      return "Проверено";
    }

    return status;
  }

  shouldShowSpinner(status: string) {
    return status === 'parsing';
  }

  deleteMenu(menu: Menu) {
    const id = this.menu.id;

    if (!id) {
      return;
    }

    this.translate.get('menu.delete_confirmation').subscribe((text) => {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '350px',
        panelClass: 'mat-dialog-confirmation-container',
        data: { message: text + ' "' + menu.name + '"?' },
      });

      dialogRef.componentInstance.callback.subscribe((e) => {
        this.menuService.deleteMenu(id).subscribe(
          (r: any) => {
            dialogRef.close(true);
            this.onMenuDeleted.emit();
          },
          (error: any) => {
            // this.notify.error(JSON.stringify(error));
          }
        );
      });
    });
  }

  viewMenu(menu: Menu) {
    this.dialog.open(MenuComponent, {
      width: '700px',
      height: '950px',
      data: menu,
    });
  }

  refreshState() {
    const id = this.menu.id;

    if (!id) {
      return;
    }

    this.refreshDisabled = true;
    this.opacity = 0.5;

    this.menuService.getMenuState(id).subscribe(
      (menu: any) => {
        this.menu = menu;
        this.opacity = 1;
        this.refreshDisabled = false;
      },
      (e) => {
        // this.notify.error(e);
        this.opacity = 1;
        this.refreshDisabled = false;
      }
    );
  }

  openSmartMenu(menu: Menu) {
    this.router.navigate(['menus', menu.id]);
  }
}
