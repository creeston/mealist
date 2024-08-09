import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from 'pdfjs-dist';
import { MenuComponent } from '../menu/menu.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../services/menu.service';
import { ScreenService } from '../../services/screen.service';
import { Globals } from '../../globals';
import { TranslateHelperClass } from '../../services/translate-helper.service';
import { AuthenticationService } from '../../services/auth.service';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { Menu } from '../../api/model/menu';
import { PageEvent } from '@angular/material/paginator';


GlobalWorkerOptions.workerSrc = 'pdf.worker.mjs';

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
  openedPdf: PDFDocumentProxy | null = null;
  renderedImages: string[] = [];

  StopListFeature = 'stop_list';

  constructor(
    public dialog: MatDialog,
    public screen: ScreenService,
    private menuService: MenuService,
    private router: Router,
    public globals: Globals,
    private translate: TranslateService,
    public translateHelper: TranslateHelperClass,
    private auth: AuthenticationService
  ) { }

  ngOnInit(): void { }

  async showPdfGallery(menu: Menu) {
    if (!menu.images || menu.images.length == 0) {
      return;
    }

    if (!menu.originalFileUrl) {
      return;
    }

    if (this.displayMenu) {
      this.displayMenu = false;
      return;
    }

    let pagesCount = menu.images.length;
    this.renderedImages = []
    if (this.openedPdf == null) {
      const getDocumentTaskPromise = getDocument(menu.originalFileUrl).promise;
      this.openedPdf = await getDocumentTaskPromise;
    }

    for (let i = 0; i < pagesCount; i++) {
      let page = await this.openedPdf.getPage(i + 1);
      var viewport = page.getViewport({ scale: 1 });
      var canvas = document.getElementById('canvas' + menu.id + '_' + i) as any;
      var context = canvas.getContext('2d');
      let rate = this.screen.width / viewport.width;
      if (viewport.height * rate > this.screen.height) {
        rate = this.screen.height / viewport.height;
        canvas.height = this.screen.height;
        canvas.width = viewport.width * rate;
      } else {
        canvas.height = viewport.height * rate;
        canvas.width = this.screen.width;
      }
      viewport = page.getViewport({ scale: rate });
      const renderTaskPromise = page.render({ canvasContext: context, viewport: viewport }).promise;
      await renderTaskPromise;
      this.renderedImages.push(canvas.toDataURL('image/jpeg'));
    }
    for (let i = 0; i < pagesCount; i++) {
      var canvas = document.getElementById('canvas' + menu.id + '_' + i) as any;
      canvas.height = 0;
      canvas.width = 0;
    }

    this.displayMenu = true;
  }

  openPdf(menu: Menu) {
    window.open(menu.originalFileUrl, '_blank');
  }

  handlePageChange(event: PageEvent) {
    this.currentMenuPage = event.pageIndex;
  }

  getStatus(status: string) {
    if (status === "parsing") {
      return "Разбор PDF файла"
    } else if (status === "parsed") {
      return "PDF файл разобран"
    }

    return "";
  }

  shouldShowSpinner(status: string) {
    return status === "parsing";
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

  enableStopList(e: any) {
    this.loading.emit(true);
    e.source.checked = false;
    const id = this.menu.id;

    if (!id) {
      return;
    }
    this.menuService.triggerFeature(id, this.StopListFeature).subscribe(
      (menu: any) => {
        this.loading.emit(false);
        this.menu.stopListEnabled = (menu as Menu).stopListEnabled;
        e.source.checked = this.menu.stopListEnabled;
      },
      (e) => {
        this.loading.emit(false);
        // this.notify.error(JSON.stringify(e));
      }
    );
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
