import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getDocument } from 'pdfjs-dist';
import { MenuComponent } from '../menu/menu.component';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuService } from '../../services/menu.service';
import { ScreenService } from '../../services/screen.service';
import { Globals } from '../../globals';
import { TranslateHelperClass } from '../../services/translate-helper.service';
import { AuthenticationService } from '../../services/auth.service';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import {
  TutorialComponent,
  TutorialResponse,
} from '../../components/tutorial/tutorial';
import { Menu } from '../../api/model/menu';

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
  ) {}

  ngOnInit(): void {}

  async showPdfGallery(menu: Menu) {
    this.loading.emit(true);
    let images = [];
    if (!menu.images || menu.images.length == 0) {
      this.loading.emit(false);
      return;
    }

    if (!menu.originalFileUrl) {
      this.loading.emit(false);
      return;
    }

    let pagesCount = menu.images.length;
    let pdfDoc = await getDocument(menu.originalFileUrl).promise;
    for (let i = 0; i < pagesCount; i++) {
      let page = await pdfDoc.getPage(i + 1);
      var viewport = page.getViewport({ scale: 1 });
      var canvas = document.getElementById('canvas' + i) as any;
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
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      images.push(canvas.toDataURL('image/jpeg'));
    }
    images = images.map((i: string) => {
      return { path: i };
    });
    let prop = {
      images: images,
      index: 0,
      counter: true,
    };
    this.loading.emit(false);
    // this.gallery.load(prop);

    for (let i = 0; i < pagesCount; i++) {
      var canvas = document.getElementById('canvas' + i) as any;
      canvas.height = 0;
      canvas.width = 0;
    }
  }

  openPdf(menu: Menu) {
    window.open(menu.originalFileUrl, '_blank');
  }

  showGallery(menu: Menu) {
    if (!menu.images || menu.images.length == 0) {
      return;
    }
    let images = menu.images.map((i: string) => {
      return { path: i, height: this.screen.height };
    });
    let prop = {
      images: images,
      index: 0,
      counter: true,
    };
    // this.gallery.load(prop);
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

  disableStopList(e: any) {
    const id = this.menu.id;

    if (!id) {
      return;
    }
    this.loading.emit(true);
    e.source.checked = true;
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

  change(e: any) {
    let features = this.globals.userProfile!.featuresToLearn;
    if (
      !this.menu.stopListEnabled &&
      features.indexOf(this.StopListFeature) >= 0
    ) {
      e.source.checked = false;
      let dialogRef = this.dialog.open(TutorialComponent, {
        width: '650px',
        data: { tutorial_id: this.StopListFeature },
      });
      dialogRef.afterClosed().subscribe((r: TutorialResponse) => {
        if (!r) {
          return;
        }
        if (r.stopTutorial) {
          this.globals.userProfile!.featuresToLearn = features.filter(
            (f) => f != this.StopListFeature
          );
          this.auth
            .setFeaturesToLearn(this.globals.userProfile!.featuresToLearn)
            .subscribe(
              (r) => {},
              (e) => {
                // this.notify.error(JSON.stringify(e));
              }
            );
        }
        this.enableStopList(e);
      });

      return;
    }

    if (!this.menu.stopListEnabled) {
      this.enableStopList(e);
    } else {
      this.disableStopList(e);
    }
  }

  onStopListFeatureChanged() {
    const id = this.menu.id;

    if (!id) {
      return;
    }

    this.loading.emit(true);
    this.menuService.triggerFeature(id, this.StopListFeature).subscribe(
      (menu: any) => {
        this.loading.emit(false);
        this.menu = menu as Menu;
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

  requestReview() {
    const id = this.menu.id;

    if (!id) {
      return;
    }

    this.translate.get('menu.review_confirmation').subscribe((text) => {
      let lines = text
        .replace('%NUM%', 2 - this.globals.userProfile!.humanReviewCount)
        .split('\n');
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '350px',
        data: { message: lines[0], secondary_message: lines[1] },
      });
      dialogRef.componentInstance.callback.subscribe(() => {
        this.menuService.requestMenuReview(id).subscribe(
          (r: any) => {
            this.menu.state = r.state;
            dialogRef.componentInstance.close();
          },
          (e: any) => {
            // this.notify.error(e.message);
            dialogRef.componentInstance.close();
          }
        );
      });
    });
  }
}
