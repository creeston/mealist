import { RenderTask } from 'pdfjs-dist';
import {
  MenuProvider,
  ModeProvider,
  PageProvider,
  PagesProvider,
} from './providers';
import { DrawService } from '../../services/draw.service';

const SCALE_INCREMENET = 0.5;
const PDF_SCALE_FACTOR = 150 / 72;

export class CanvasDrawer {
  renderOperation: RenderTask | null = null;
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
    this.scaleValue += SCALE_INCREMENET;
  }

  decrementScale() {
    this.scaleValue -= SCALE_INCREMENET;
  }

  redrawCanvas(selectionBox: any, changePage: boolean = false) {
    let page = this.pages.value[this.page.current];
    if (changePage) {
      var viewport = page.getViewport({ scale: this.scaleValue });
      if (this.renderOperation) {
        this.renderOperation.cancel();
        this.renderOperation = null;
      }

      let canvas = this.imageCanvasRef.nativeElement;
      let context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      this.renderOperation = page.render({
        canvasContext: context,
        viewport: viewport,
      });
    }

    var viewport = page.getViewport({ scale: PDF_SCALE_FACTOR });
    let canvas = this.canvasRef.nativeElement;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    let context = canvas.getContext('2d');
    if (this.mode.isView()) {
      this.drawViewCanvas(context);
    } else {
      this.drawEditCanvas(context, selectionBox);
    }
    this.canvasPainted = true;
  }

  drawViewCanvas(context: any) {
    if (!this.menu.value || !this.menu.value.markups) {
      return;
    }
    context.lineWidth = 3;
    context.strokeStyle = this.menu.value.stopColor;
    for (
      let i = 0;
      i < this.menu.value.markups[this.page.current].length;
      i++
    ) {
      let line = this.menu.value.markups[this.page.current][i];
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
          this.menu.value.stopStyle ?? 'underline',
          this.menu.value.stopColor ?? 'black'
        );
      }
    }
  }

  drawEditCanvas(context: any, selectionBox: any) {
    if (!this.menu.value || !this.menu.value.markups) {
      return;
    }
    for (
      let i = 0;
      i < this.menu.value.markups[this.page.current].length;
      i++
    ) {
      let line = this.menu.value.markups[this.page.current][i];
      let x = line.x1;
      let y = line.y1;
      let w = line.x2 - x;
      let h = line.y2 - y;
      if (!line.hover && !line.editSelected) {
        context.beginPath();
        if (line.tag == 'DISH') {
          context.strokeStyle = '#627320';
        } else if (line.tag == 'CATEGORY') {
          context.strokeStyle = 'red';
        } else {
          context.strokeStyle = 'blue';
        }
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
        context.lineWidth = 2;
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
