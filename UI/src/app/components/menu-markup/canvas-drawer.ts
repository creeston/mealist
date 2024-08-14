import {
  MenuProvider,
  ModeProvider,
  PageProvider,
  PagesProvider,
} from './providers';
import { DrawService } from '../../services/draw.service';

const SCALE_INCREMENT = 0.5;

export class CanvasDrawer {
  canvasPainted: boolean = false;
  scaleValue = 1;
  private canvasRef: any;
  private imageCanvasRef: any;

  setElements(canvasRef: any, imageCanvasRef: any) {
    this.canvasRef = canvasRef;
    this.imageCanvasRef = imageCanvasRef;
  }

  constructor(
    private draw: DrawService,
    private mode: ModeProvider,
    private page: PageProvider,
    private menu: MenuProvider,
    private pages: PagesProvider
  ) { }

  incrementScale() {
    this.scaleValue += SCALE_INCREMENT;
  }

  decrementScale() {
    this.scaleValue -= SCALE_INCREMENT;
  }

  redrawCanvas(selectionBox: any, changePage: boolean = false) {
    let canvas = this.canvasRef.nativeElement;
    let imageCanvas = this.imageCanvasRef.nativeElement;

    let page = this.pages.value[this.page.current];
    const image = page.imageElement;

    if (changePage || !this.canvasPainted) {
      let context = imageCanvas.getContext('2d');
      imageCanvas.height = image.height;
      imageCanvas.width = image.width;

      canvas.height = image.height;
      canvas.width = image.width;
      context.drawImage(image, 0, 0);
      this.canvasPainted = true;
    }

    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (this.mode.isView()) {
      this.drawViewCanvas(context);
    } else {
      this.drawEditCanvas(context, selectionBox);
    }
  }

  drawViewCanvas(context: any) {
    context.lineWidth = 3;
    context.strokeStyle = this.menu.value!.stopColor;
    for (
      let i = 0;
      i < this.menu.value!.pages[this.page.current].markup.length;
      i++
    ) {
      let line = this.menu.value!.pages[this.page.current].markup[i];
      let x = line.x1;
      let y = line.y1;
      let w = line.x2 - x;
      let h = line.y2 - y;
      if (!line.viewSelected) {
        this.draw.drawStopDish(
          context,
          x,
          y,
          w,
          h,
          this.menu.value!.stopStyle ?? 'underline',
          this.menu.value!.stopColor ?? 'black'
        );
      }
    }
  }

  drawEditCanvas(context: any, selectionBox: any) {
    const page = this.menu.value!.pages[this.page.current];
    for (let i = 0; i < page.markup.length; i++) {
      let line = page.markup[i];
      let x = line.x1;
      let y = line.y1;
      let w = line.x2 - x;
      let h = line.y2 - y;
      if (!line.hover && !line.editSelected) {
        context.beginPath();
        context.strokeStyle = '#627320';
        context.lineWidth = 2;
        context.rect(x - 1, y - 1, w + 2, h + 2);
        context.stroke();
        context.lineWidth = 1;
        context.beginPath();
        context.strokeStyle = '#fff6f0';
        context.rect(x, y, w, h);
        context.stroke();
      } else {
        context.beginPath();
        context.strokeStyle = '#4F4742';
        context.lineWidth = 5;
        context.rect(x - 2, y - 2, w + 4, h + 4);
        context.stroke();
        context.lineWidth = 1;
        context.beginPath();
        context.strokeStyle = '#fff6f0';
        context.rect(x, y, w, h);
        context.stroke();
      }
    }

    if (selectionBox) {
      let x = selectionBox[0][0];
      let y = selectionBox[0][1];
      let w = selectionBox[1][0] - x;
      let h = selectionBox[1][1] - y;
      context.beginPath();
      context.fillStyle = 'rgba(225,0,0,0.3)';
      context.fillRect(x, y, w, h);
      context.stroke();
    }
  }
}
