import { PDFPageProxy } from 'pdfjs-dist';
import { Menu, MenuLine } from '../../services/menu.service';

const PDF_SCALE_FACTOR = 150 / 72;

export class ModeProvider {
  public value: string = 'edit';

  switchToEdit() {
    this.value = 'edit';
  }

  switchToView() {
    this.value = 'view';
  }

  isView = () => this.value == 'view';
  isEdit = () => this.value == 'edit';
}

export class MenuProvider {
  public value: Menu | null = null;

  public setMenu(menu: Menu) {
    this.value = menu;
  }
}

export class PagesProvider {
  public value: PDFPageProxy[] = [];

  public setPages(pages: PDFPageProxy[]) {
    this.value = pages;
  }
}

export class PageProvider {
  public current: number = 0;

  changePage(value: number) {
    this.current = value;
  }
}

export class SelectionProvider {
  constructor(
    private page: PageProvider,
    private menu: MenuProvider,
    private pages: PagesProvider
  ) {}

  getLeftSelection(canvas: any) {
    if (!this.menu.value) {
      return 0;
    }
    let selection = this.menu.value.markups[this.page.current].filter(
      (l: MenuLine) => l.editSelected
    );
    if (selection.length == 0) {
      return 0;
    }
    let x: any[] = [];
    let texts = [];
    selection.forEach((l) => {
      x.push(l.x1);
      x.push(l.x2);
      texts.push(l.text);
    });

    let left = Math.max(...x);
    let rect = canvas.getBoundingClientRect();
    let page = this.pages.value[this.page.current];
    var viewport = page.getViewport({ scale: PDF_SCALE_FACTOR });

    let canvasRealHeight = rect.height;
    let canvasHeight = viewport.height;
    let ratio = canvasHeight / canvasRealHeight;
    let leftOffset = canvas.offsetLeft;
    return left / ratio + leftOffset + 3;
  }

  getTopSelection(canvas: any) {
    if (!this.menu.value) {
      return 0;
    }
    let selection = this.menu.value.markups[this.page.current].filter(
      (l: MenuLine) => l.editSelected
    );
    if (selection.length == 0) {
      return 0;
    }
    let y: any[] = [];
    let texts = [];
    selection.forEach((l: MenuLine) => {
      y.push(l.y1);
      y.push(l.y2);
      texts.push(l.text);
    });

    let top = Math.min(...y);
    let rect = canvas.getBoundingClientRect();
    let page = this.pages.value[this.page.current];
    var viewport = page.getViewport({ scale: PDF_SCALE_FACTOR });

    let canvasRealHeight = rect.height;
    let canvasHeight = viewport.height;
    let ratio = canvasHeight / canvasRealHeight;
    let topOffset = canvas.offsetTop;
    return top / ratio + topOffset - 15;
  }

  isAnySelected() {
    if (!this.menu.value) {
      return false;
    }
    return (
      this.menu.value.markups[this.page.current].findIndex(
        (l: MenuLine) => l.editSelected
      ) >= 0
    );
  }
}
