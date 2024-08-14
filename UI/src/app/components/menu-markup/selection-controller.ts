import { CanvasController } from './canvas-controller';
import { CanvasDrawer } from './canvas-drawer';
import { MarkedLine } from './marked-menu';
import { MenuProvider, PageProvider } from './providers';

export class SelectionController {
  constructor(
    private canvas: CanvasDrawer,
    private page: PageProvider,
    private controller: CanvasController,
    private menu: MenuProvider
  ) { }

  moveLeft() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    let line = selection[0];
    let newValue = (line.x1 -= 1);
    selection.forEach((l: any) => {
      l.x1 = Math.round(newValue);
    });
    this.redrawCanvas();
  }

  moveRight() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    let line = selection[0];
    let newValue = (line.x1 += 1);
    selection.forEach((l: any) => {
      l.x1 = Math.round(newValue);
    });
    this.redrawCanvas();
  }

  moveUp() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    selection.forEach((l: any) => {
      l.y1 -= 1;
    });
    this.redrawCanvas();
  }

  moveDown() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    selection.forEach((l: any) => {
      l.y1 += 1;
    });
    this.redrawCanvas();
  }

  moveLeft2() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    let line = selection[0];
    let newValue = (line.x2 -= 1);
    selection.forEach((l: any) => {
      l.x2 = Math.round(newValue);
    });
    this.redrawCanvas();
  }

  moveRight2() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    let line = selection[0];
    let newValue = (line.x2 += 1);
    selection.forEach((l: any) => {
      l.x2 = Math.round(newValue);
    });
    this.redrawCanvas();
  }

  moveUp2() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    selection.forEach((l: any) => {
      l.y2 -= 1;
    });
    this.redrawCanvas();
  }

  moveDown2() {
    if (!this.menu.value) {
      return;
    }
    let selection = this.menu.value.pages[this.page.current].markup.filter(
      (l: MarkedLine) => l.editSelected
    );
    if (selection.length == 0) {
      return;
    }
    selection.forEach((l: any) => {
      l.y2 += 1;
    });
    this.redrawCanvas();
  }

  redrawCanvas() {
    this.canvas.redrawCanvas(this.controller.selectionBox);
  }
}
