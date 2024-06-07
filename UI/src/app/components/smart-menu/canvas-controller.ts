import { MenuLine } from '../../services/menu.service';
import { CanvasDrawer } from './canvas-drawer';
import { MenuProvider, ModeProvider, PageProvider } from './providers';

export class CanvasController {
  private mousePressed: boolean = false;
  public yPressed: number = -1;
  public xPressed: number = -1;
  public x1Resize: boolean = false;
  public y1Resize: boolean = false;
  public x2Resize: boolean = false;
  public y2Resize: boolean = false;
  public xyMove: boolean = false;

  public selectionBox: number[][] | null = null;

  private canvasRef: any;

  constructor(
    private mode: ModeProvider,
    private page: PageProvider,
    private canvasDrawer: CanvasDrawer,
    private menu: MenuProvider
  ) {}

  setCanvas(canvasRef: any) {
    this.canvasRef = canvasRef;
    let canvas = this.canvasRef.nativeElement;
    canvas.addEventListener('mousedown', (e: any) => this.pressEventHandler(e));
    canvas.addEventListener('mousemove', (e: any) => this.dragEventHandler(e));
    canvas.addEventListener('mouseup', () => this.releaseEventHandler());
    canvas.addEventListener('mouseout', () => this.cancelEventHandler());
  }

  releaseEventHandler() {
    if (!this.menu.value) {
      return;
    }
    this.mousePressed = false;
    this.yPressed = -1;
    this.xPressed = -1;

    if (this.selectionBox) {
      let x1 = this.selectionBox[0][0];
      let y1 = this.selectionBox[0][1];
      let x2 = this.selectionBox[1][0];
      let y2 = this.selectionBox[1][1];
      if (x1 > x2) {
        let temp = x1;
        x1 = x2;
        x2 = temp;
        temp = y1;
        y1 = y2;
        y2 = temp;
      }

      this.menu.value.markups[this.page.current].forEach((l: MenuLine) => {
        if (
          l.x1 >= x1 &&
          l.x1 <= x2 &&
          l.x2 >= x1 &&
          l.x2 <= x2 &&
          l.y1 >= y1 &&
          l.y1 <= y2 &&
          l.y2 >= y1 &&
          l.y2 <= y2
        ) {
          l.editSelected = true;
        }
      });
      this.selectionBox = null;
    }
  }

  public cancelEventHandler() {
    this.mousePressed = false;
    this.yPressed = -1;
    this.xPressed = -1;
    this.selectionBox = null;
  }

  public pressEventHandler(e: MouseEvent | TouchEvent) {
    if (!this.menu.value) {
      return;
    }
    let canvas = this.canvasRef.nativeElement;

    let x = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageX
      : (e as MouseEvent).pageX;
    let y = (e as TouchEvent).changedTouches
      ? (e as TouchEvent).changedTouches[0].pageY
      : (e as MouseEvent).pageY;

    let rect = canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;

    let canvasRealHeight = rect.height;
    let canvasHeight = canvas.height;
    let ratio = canvasHeight / canvasRealHeight;
    x = x * ratio;
    y = y * ratio;

    this.yPressed = y;
    this.xPressed = x;
    this.mousePressed = true;

    if (
      this.mode.value == 'edit' &&
      !this.x1Resize &&
      !this.y1Resize &&
      !this.x2Resize &&
      !this.y2Resize
    ) {
      for (
        let i = 0;
        i < this.menu.value.markups[this.page.current].length;
        i++
      ) {
        let line = this.menu.value.markups[this.page.current][i];
        if (line.hover) {
          line.editSelected = true;
          // SCROLLING FUNCTIONALITY
          // let el = document.getElementById('line_' + i);
          // el.scrollIntoView();
        } else if (line.editSelected && (e.shiftKey || e.ctrlKey)) {
          line.editSelected = true;
        } else {
          line.editSelected = false;
        }
      }
      this.redrawCanvas();
    } else if (this.mode.value == 'edit') {
    }
  }

  dragEventHandler(e: MouseEvent) {
    if (!this.menu.value) {
      return;
    }
    let canvas = this.canvasRef.nativeElement;
    let x = (e as MouseEvent).pageX;
    let y = (e as MouseEvent).pageY;
    let rect = canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    let canvasRealHeight = rect.height;
    let canvasHeight = canvas.height;
    let ratio = canvasHeight / canvasRealHeight;

    x = x * ratio;
    y = y * ratio;

    let selection = this.menu.value.markups[this.page.current].filter(
      (l: MenuLine) => l.editSelected
    );

    if (this.mousePressed) {
      if (this.x1Resize) {
        selection.forEach((l: any) => {
          l.x1 = Math.round(x);
        });
        this.redrawCanvas();
      } else if (this.x2Resize) {
        selection.forEach((l: any) => {
          l.x2 = Math.round(x);
        });
        this.redrawCanvas();
      } else if (this.y1Resize) {
        let offset = Math.round(this.yPressed - y);
        selection.forEach((l: any) => {
          l.y1 -= offset;
        });
        this.redrawCanvas();
        this.yPressed = y;
      } else if (this.y2Resize) {
        let offset = Math.round(y - this.yPressed);
        selection.forEach((l: any) => {
          l.y2 += offset;
        });
        this.redrawCanvas();
        this.yPressed = y;
      } else if (this.xyMove) {
        let yOffset = Math.round(y - this.yPressed);
        let xOffset = Math.round(x - this.xPressed);
        selection.forEach((l: any) => {
          l.y2 += yOffset;
          l.y1 += yOffset;
          l.x1 += xOffset;
          l.x2 += xOffset;
        });
        this.redrawCanvas();
        this.yPressed = y;
        this.xPressed = x;
      } else {
        // selection mode
        this.selectionBox = [
          [this.xPressed, this.yPressed],
          [x, y],
        ];
        this.redrawCanvas();
      }
      return;
    }

    this.xyMove = false;
    this.x1Resize = false;
    this.y1Resize = false;
    this.x2Resize = false;
    this.y2Resize = false;

    if (this.mode.value == 'edit') {
      for (
        let i = 0;
        i < this.menu.value.markups[this.page.current].length;
        i++
      ) {
        let line = this.menu.value.markups[this.page.current][i];
        if (x > line.x1 && x < line.x2 && y > line.y1 && y < line.y2) {
          line.hover = true;
          if (line.editSelected) {
            this.xyMove = true;
          }
        } else {
          line.hover = false;
        }

        // Horizontal border hover
        if (
          line.editSelected &&
          x > line.x1 - 5 &&
          x <= line.x1 &&
          y > line.y1 &&
          y < line.y2
        ) {
          this.x1Resize = true;
        }

        if (
          line.editSelected &&
          x < line.x2 + 5 &&
          x > line.x2 &&
          y > line.y1 &&
          y < line.y2
        ) {
          this.x2Resize = true;
        }

        // Verticle border hover
        if (
          line.editSelected &&
          y > line.y1 - 5 &&
          y <= line.y1 &&
          x > line.x1 &&
          x < line.x2
        ) {
          this.y1Resize = true;
        }

        if (
          line.editSelected &&
          y < line.y2 + 5 &&
          y > line.y2 &&
          x > line.x1 &&
          x < line.x2
        ) {
          this.y2Resize = true;
        }
      }
      this.redrawCanvas();
    }

    e.preventDefault();
  }

  redrawCanvas() {
    this.canvasDrawer.redrawCanvas(this.selectionBox, false);
  }
}
