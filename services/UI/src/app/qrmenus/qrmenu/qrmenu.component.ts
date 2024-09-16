import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  Directive,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
import { QrMenuService, QrRoutingParams } from '../../services/qrmenu.service';
import { Globals } from '../../globals';
import { DrawService } from '../../services/draw.service';
import { QrMenu, QrMenuItem } from '../../api';

@Component({
  selector: 'app-qr-menu',
  templateUrl: './qrmenu.component.html',
  styleUrls: ['./qrmenu.component.scss'],
})
export class QrMenuComponent implements OnInit {
  @Input()
  menuIdParam!: string;

  @Input()
  userIdParam!: string;

  @Input()
  qrMenuParam!: QrMenu;

  @Input()
  previewImageParam!: string;

  @Input()
  menuLoading!: boolean;

  @Output()
  public colorDetected = new EventEmitter<any>();

  menuId: string | undefined;
  userId: string | undefined;
  urlSuffix: string | undefined;
  qrMenu: QrMenu | undefined = undefined;
  selectedMenu: QrMenuItem | undefined = undefined;
  imagesData: any[] = [];
  previewMode = true;
  loading = true;
  Arr = Array;

  constructor(
    private route: ActivatedRoute,
    public globals: Globals,
    private service: QrMenuService,
    private draw: DrawService
  ) {
    if (!this.qrMenuParam) {
      this.globals.role = 'guest';
    }
  }

  ngOnInit(): void {
    if (this.qrMenuParam) {
      this.previewMode = true;
      this.globals.role = 'client';
      this.qrMenu = this.qrMenuParam;
      this.loading = false;
    } else {
      this.globals.role = 'guest';
      this.getMenu();
    }
  }

  getMenu() {
    this.route.params.subscribe((p: any) => {
      this.previewMode = false;
      if (p.suffix) {
        this.urlSuffix = p.suffix;
        this.service
          .getMenuRoutingParams(p.suffix)
          .subscribe((r: QrRoutingParams) => {
            this.menuId = r.qrMenuId;
            this.userId = r.userId;
            this.service.getMenu(this.menuId, this.userId).then((r: QrMenu) => {
              this.qrMenu = r;
              this.setMenuColors();
              this.initializeMenuImages();
            });
          });
      } else {
        this.menuId = p.menuId;
        this.userId = p.userId;
        if (this.menuId && this.userId) {
          this.service.getMenu(this.menuId!, this.userId!).then((r: QrMenu) => {
            this.qrMenu = r;
            this.setMenuColors();
            this.initializeMenuImages();
          });
        }
      }
    });
  }

  setMenuColors() {
    if (!this.qrMenu) {
      return;
    }
    if (!this.qrMenu.primaryColor) {
      this.qrMenu.primaryColor = '#3f51b5';
    }
    if (!this.qrMenu.secondaryColor) {
      this.qrMenu.secondaryColor = '#3f51b5c0';
    }
    if (!this.qrMenu.fontColor) {
      this.qrMenu.fontColor = '#ffffff';
    }
  }

  initializeMenuImages() {
    if (!this.qrMenu) {
      return;
    }
    this.qrMenu.items!.forEach((item: QrMenuItem) => {
      if (!item.thumbnailIndex) {
        item.thumbnailIndex = 0;
      }
      this.loading = false;
    });
  }

  openMenu(menuItem: QrMenuItem) {
    this.imagesData = [];
    for (let pageId = 0; pageId < menuItem.menu!.pages!.length; pageId++) {
      this.imagesData.push({ width: 0, height: 0 });
    }
    this.selectedMenu = menuItem;
  }

  drawCanvas(i: number) {
    if (!this.qrMenu || !this.selectedMenu) {
      return;
    }

    let imageElementOriginal = document.getElementById(
      'image_original_' + i
    ) as any;
    let imageElement = document.getElementById('image_' + i) as any;
    let canvas = document.getElementById('canvas_' + i) as any;
    if (!canvas) {
      return;
    }
    canvas.height = imageElementOriginal.offsetHeight;
    canvas.width = imageElementOriginal.offsetWidth;
    let context = canvas.getContext('2d');
    context.drawImage(imageElementOriginal, 0, 0, canvas.width, canvas.height);

    let realHeight = imageElementOriginal.naturalHeight;

    let rate = canvas.height / realHeight;

    context.lineWidth = 3;
    let menuindex = this.qrMenu.items!.indexOf(this.selectedMenu);
    // TODO Consider using separate stop list
    // let markup = this.menu.stopMarkup[menuindex][i];
    let markup = this.qrMenu.items![menuindex].menu!.pages![i].markup!;
    context.strokeStyle = 'red';
    markup.forEach((line) => {
      let x1 = line.x1 * rate;
      let y1 = line.y1 * rate;
      let x2 = line.x2 * rate;
      let y2 = line.y2 * rate;

      let x = x1;
      let y = y1;
      let w = x2 - x;
      let h = y2 - y;

      this.draw.drawStopDish(
        context,
        x,
        y,
        w,
        h,
        this.selectedMenu!.menu!.stopStyle!,
        this.selectedMenu!.menu!.stopColor!
      );
    });
    imageElement.src = canvas.toDataURL();
    canvas.parentNode.removeChild(canvas);
    imageElementOriginal.parentNode.removeChild(imageElementOriginal);
  }

  setCanvasWidthHeight(i: number) {
    if (!this.qrMenu || !this.selectedMenu) {
      return;
    }

    let imageElement = document.getElementById('image_' + i) as any;
    let canvas = document.getElementById('canvas_' + i) as any;
    canvas.height = imageElement.offsetHeight;
    canvas.width = imageElement.offsetWidth;
    let context = canvas.getContext('2d');
    let realHeight = imageElement.naturalHeight;

    let rate = canvas.height / realHeight;

    context.lineWidth = 3;
    let menuindex = this.qrMenu.items!.indexOf(this.selectedMenu);
    // TODO Consider using separate stop list
    // let markup = this.menu.stopMarkup[menuindex][i];
    let markup = this.qrMenu.items![menuindex].menu!.pages![i].markup!;
    context.strokeStyle = 'red';
    markup.forEach((line) => {
      let x1 = line.x1 * rate;
      let y1 = line.y1 * rate;
      let x2 = line.x2 * rate;
      let y2 = line.y2 * rate;

      let x = x1;
      let y = y1;
      let w = x2 - x;
      let h = y2 - y;

      this.draw.drawStopDish(
        context,
        x,
        y,
        w,
        h,
        this.selectedMenu!.menu!.stopStyle!,
        this.selectedMenu!.menu!.stopColor!
      );
    });
  }

  back() {
    this.selectedMenu = undefined;
  }
}

@Directive({
  selector: 'img[loaded]',
})
export class LoadedDirective {
  @Output() loaded = new EventEmitter();

  @HostListener('load')
  onLoad() {
    this.loaded.emit();
  }

  constructor(private elRef: ElementRef<HTMLImageElement>) {
    if (this.elRef.nativeElement.complete) {
      this.loaded.emit();
    }
  }
}
