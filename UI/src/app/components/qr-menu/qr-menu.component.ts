import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { getDocument } from 'pdfjs-dist';

import ColorThief from 'colorthief';
import {
  Directive,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
} from '@angular/core';
import {
  QrItem,
  QrMenu,
  QrMenuService,
  QrRoutingParams,
} from '../../services/qrmenu.service';
import { Globals } from '../../globals';
import { DrawService } from '../../services/draw.service';

const colorThief = new ColorThief();

@Component({
  selector: 'app-qr-menu',
  templateUrl: './qr-menu.component.html',
  styleUrls: ['./qr-menu.component.scss'],
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
  menu: QrMenu | undefined = undefined;
  selectedMenu: QrItem | undefined = undefined;
  imagesData: any[] = [];
  previewMode = true;
  loading = true;
  isColorDetected = false;
  public color1 = '';
  public color2 = '';
  public color3 = '';
  public color4 = '';

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
      this.menu = this.qrMenuParam;
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
            this.service
              .getMenu(this.menuId, this.userId)
              .subscribe((r: QrMenu) => {
                this.menu = r;
                this.setMenuColors();
                this.initializeMenuImages();
              });
          });
      } else {
        this.menuId = p.menuId;
        this.userId = p.userId;
        this.service
          .getMenu(this.menuId!, this.userId!)
          .subscribe((r: QrMenu) => {
            this.menu = r;
            this.setMenuColors();
            this.initializeMenuImages();
          });
      }
    });
  }

  setMenuColors() {
    if (!this.menu) {
      return;
    }
    if (!this.menu.primaryColor) {
      this.menu.primaryColor = '#3f51b5';
    }
    if (!this.menu.secondaryColor) {
      this.menu.secondaryColor = '#3f51b5c0';
    }
    if (!this.menu.fontColor) {
      this.menu.fontColor = '#ffffff';
    }
  }

  initializeMenuImages() {
    if (!this.menu) {
      return;
    }
    this.menu.menuItems.forEach((item: QrItem) => {
      if (!item.thumbnailIndex) {
        item.thumbnailIndex = 0;
      }
      if (item.images.length == 0) {
        let i = this.menu!.menuItems.indexOf(item);
        item.images = Array(item.pagesCount).fill('');
        getDocument(item.originalFileUrl).promise.then((doc) => {
          for (let j = 0; j < item.pagesCount; j++) {
            doc.getPage(j + 1).then((page) => {
              var viewport = page.getViewport({ scale: 3 });
              var canvas = document.getElementById(
                'viewcanvas_' + i + '_' + j
              ) as any;
              var context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              page
                .render({ canvasContext: context, viewport: viewport })
                .promise.then((r) => {
                  item.images[j] = canvas.toDataURL('image/jpeg');
                  canvas.width = 0;
                  canvas.height = 0;
                  this.loading = false;
                });
            });
          }
        });
      } else {
        this.loading = false;
      }
    });
  }

  rgbToHex(r: number, g: number, b: number) {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  }

  checkMenuColors() {
    const img = document.querySelector('img.menu-thumbnail') as any;
    img.crossOrigin = 'Anonymous';
    let result = colorThief.getColor(img);
    let palette = colorThief.getPalette(img);
    let color1 = this.rgbToHex(result[0], result[1], result[2]);
    let color2 = this.rgbToHex(palette[0][0], palette[0][1], palette[0][2]);
    let color3 = this.rgbToHex(palette[1][0], palette[1][1], palette[1][2]);
    let color4 = this.rgbToHex(palette[2][0], palette[2][1], palette[2][2]);
    this.colorDetected.emit([color1, color2, color3, color4]);
  }

  checkColors() {
    const img = document.querySelector('img.menu-thumbnail') as any;
    img.crossOrigin = 'Anonymous';
    let result = colorThief.getColor(img);
    let palette = colorThief.getPalette(img);
    this.color1 = this.rgbToHex(result[0], result[1], result[2]);
    this.color2 = this.rgbToHex(palette[0][0], palette[0][1], palette[0][2]);
    this.color3 = this.rgbToHex(palette[1][0], palette[1][1], palette[1][2]);
    this.color4 = this.rgbToHex(palette[2][0], palette[2][1], palette[2][2]);
    this.isColorDetected = true;
  }

  openMenu(menuItem: QrItem) {
    this.imagesData = [];
    for (let pageId = 0; pageId < menuItem.pagesCount; pageId++) {
      this.imagesData.push({ width: 0, height: 0 });
    }
    this.selectedMenu = menuItem;
  }

  drawCanvas(i: number) {
    if (!this.menu || !this.selectedMenu) {
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
    let menuindex = this.menu.menuItems.indexOf(this.selectedMenu);
    let markup = this.menu.stopMarkup[menuindex][i];
    context.strokeStyle = 'red';
    markup.forEach((line) => {
      let box = line.box;
      let x1 = box[0][0] * rate;
      let y1 = box[0][1] * rate;
      let x2 = box[1][0] * rate;
      let y2 = box[1][1] * rate;

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
        this.selectedMenu!.menu!.stopStyle,
        this.selectedMenu!.menu!.stopColor
      );
    });
    imageElement.src = canvas.toDataURL();
    canvas.parentNode.removeChild(canvas);
    imageElementOriginal.parentNode.removeChild(imageElementOriginal);
  }

  setCanvasWidthHeight(i: number) {
    if (!this.menu || !this.selectedMenu) {
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
    let menuindex = this.menu.menuItems.indexOf(this.selectedMenu);
    let markup = this.menu.stopMarkup[menuindex][i];
    context.strokeStyle = 'red';
    markup.forEach((line) => {
      let box = line.box;
      let x1 = box[0][0] * rate;
      let y1 = box[0][1] * rate;
      let x2 = box[1][0] * rate;
      let y2 = box[1][1] * rate;

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
        this.selectedMenu!.menu!.stopStyle,
        this.selectedMenu!.menu!.stopColor
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
