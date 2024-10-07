import { Component, Input, OnInit } from '@angular/core';
import { QrMenuSpecification } from '../../models/qrmenu-specification';
import { MenuSpecification } from '../../models/menu-specification';
import { DrawService } from '../../services/draw.service';
import { GradientBorderComponent } from '../gradient-border/gradient-border.component';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';

@Component({
  selector: 'app-qr-menu',
  templateUrl: './qrmenu.component.html',
  styleUrls: ['./qrmenu.component.scss'],
  standalone: true,
  imports: [GradientBorderComponent, CommonModule, NgIconsModule],
  providers: [DrawService],
})
export class QrMenuComponent implements OnInit {
  @Input({ required: true })
  qrMenuParam!: QrMenuSpecification;

  @Input({ required: true })
  previewMode!: boolean;

  @Input()
  previewImageParam!: string;

  @Input()
  menuLoading!: boolean;

  urlSuffix: string | undefined;
  qrMenu: QrMenuSpecification | undefined = undefined;
  selectedMenu: MenuSpecification | undefined = undefined;
  imagesData: any[] = [];
  loading = false;

  constructor(private draw: DrawService) {}

  ngOnInit(): void {
    this.qrMenu = this.qrMenuParam;
  }

  setMenuColors(qrMenu: QrMenuSpecification) {
    if (!qrMenu.style.headerColor) {
      qrMenu.style.headerColor = '#3f51b5';
    }
    if (!qrMenu.style.actionsColor) {
      qrMenu.style.actionsColor = '#3f51b5c0';
    }
    if (!qrMenu.style.fontColor) {
      qrMenu.style.fontColor = '#ffffff';
    }
    if (!qrMenu.style.backgroundColor) {
      qrMenu.style.backgroundColor = '#ffffff';
    }
  }

  openMenu(menuItem: MenuSpecification) {
    this.imagesData = [];
    for (let pageId = 0; pageId < menuItem.pages!.length; pageId++) {
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
    let menuindex = this.qrMenu.menus!.indexOf(this.selectedMenu);
    let markup = this.qrMenu.menus![menuindex].pages![i].markup!;
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
        this.selectedMenu!.stopStyle!,
        this.selectedMenu!.stopColor!
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
    let menuindex = this.qrMenu.menus!.indexOf(this.selectedMenu);
    let markup = this.qrMenu.menus![menuindex].pages![i].markup!;
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
        this.selectedMenu!.stopStyle!,
        this.selectedMenu!.stopColor!
      );
    });
  }

  back() {
    this.selectedMenu = undefined;
  }
}
