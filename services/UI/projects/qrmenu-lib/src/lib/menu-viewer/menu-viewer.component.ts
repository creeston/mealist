import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { MenuSpecification } from '../../models/menu-specification';
import { QrMenuStyle } from '../../models/qrmenu-style';
import { DrawService } from '../../services/draw.service';

@Component({
  selector: 'lib-menu-viewer',
  standalone: true,
  imports: [CommonModule, NgIconsModule],
  templateUrl: './menu-viewer.component.html',
  styleUrl: './menu-viewer.component.css',
  providers: [DrawService],
})
export class MenuViewerComponent {
  @Input({ required: true })
  menu!: MenuSpecification;

  @Input({ required: true })
  style!: QrMenuStyle;

  @Output()
  onBackClicked: EventEmitter<void> = new EventEmitter();

  constructor(private draw: DrawService) {}

  drawCanvas(i: number) {
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
    let markup = this.menu.pages![i].markup!;
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
        this.menu.stopStyle!,
        this.menu.stopColor!
      );
    });
    imageElement.src = canvas.toDataURL();
    canvas.parentNode.removeChild(canvas);
    imageElementOriginal.parentNode.removeChild(imageElementOriginal);
  }

  setCanvasWidthHeight(i: number) {
    let imageElement = document.getElementById('image_' + i) as any;
    let canvas = document.getElementById('canvas_' + i) as any;
    canvas.height = imageElement.offsetHeight;
    canvas.width = imageElement.offsetWidth;
    let context = canvas.getContext('2d');
    let realHeight = imageElement.naturalHeight;

    let rate = canvas.height / realHeight;

    context.lineWidth = 3;
    let markup = this.menu.pages![i].markup!;
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
        this.menu!.stopStyle!,
        this.menu!.stopColor!
      );
    });
  }
}
