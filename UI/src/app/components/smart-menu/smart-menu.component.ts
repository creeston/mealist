import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { getDocument, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  MenuProvider,
  ModeProvider,
  PageProvider,
  PagesProvider,
  SelectionProvider,
} from './providers';
import { CanvasDrawer } from './canvas-drawer';
import { CanvasController } from './canvas-controller';
import { SelectionController } from './selection-controller';
import { LineController } from './line-controller';
import { TutorialComponent } from '../tutorial/tutorial';
import { MenuService } from '../../services/menu.service';
import { Globals } from '../../globals';
import { DrawService } from '../../services/draw.service';
import { Menu, MenuLine } from '../../api';

const ZOOM_INCREMENT = 25;

@Component({
  selector: 'app-smart-menu',
  templateUrl: './smart-menu.component.html',
  styleUrls: ['./smart-menu.component.css'],
})
export class SmartMenuComponent implements OnInit {
  canvasHeight: number = 80;

  menu: Menu | null = null;
  menuId: string | null = null;
  userId: string | null = null;
  originalMenu: Menu = {} as Menu;
  pages: PDFPageProxy[] = [];

  menuProvider: MenuProvider = new MenuProvider();
  page: PageProvider = new PageProvider();
  pagesProvider: PagesProvider = new PagesProvider();
  selection: SelectionProvider = new SelectionProvider(
    this.page,
    this.menuProvider,
    this.pagesProvider
  );
  mode: ModeProvider = new ModeProvider();

  canvasDrawer: CanvasDrawer | null = null;
  canvasController: CanvasController | null = null;
  selectionController: SelectionController | null = null;
  lineController: LineController = new LineController(
    this.menuProvider,
    this.page
  );

  public stopModes = [
    { key: 'underline', value: '' },
    { key: 'stop', value: '' },
  ];

  markupedSavedMessage = '';
  closeText = '';

  @ViewChild('markup') canvasRef: any;
  @ViewChild('image') imageCanvasRef: any;

  pageEvent: PageEvent = new PageEvent();
  saveDisabled: boolean = false;

  displayedColumns = ['position', 'name', 'presence'];
  primaryColors: string[] = [
    '#3f51b5',
    '#da5167',
    '#45606f',
    '#704b4b',
    '#4caf50',
    '#e6c026',
  ];

  constructor(
    public globals: Globals,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private service: MenuService,
    private snackBar: MatSnackBar,
    private draw: DrawService,
    private translate: TranslateService
  ) {
    this.canvasDrawer = new CanvasDrawer(
      this.draw,
      this.mode,
      this.page,
      this.menuProvider,
      this.pagesProvider
    );
    this.canvasController = new CanvasController(
      this.mode,
      this.page,
      this.canvasDrawer,
      this.menuProvider
    );
    this.selectionController = new SelectionController(
      this.canvasDrawer,
      this.page,
      this.canvasController,
      this.menuProvider
    );
    this.originalMenu.markups = [];
  }

  ngOnInit() {
    this.translate.get('markup.style.underline').subscribe((text) => {
      this.stopModes[0] = { key: 'underline', value: text };
    });

    this.translate.get('markup.style.overflow').subscribe((text) => {
      this.stopModes[1] = { key: 'overflow', value: text };
    });

    this.translate.get('close').subscribe((text) => {
      this.closeText = text;
    });

    this.translate.get('markup.was_saved').subscribe((text) => {
      this.markupedSavedMessage = text;
    });
  }

  ngAfterViewInit() {
    this.canvasController?.setCanvas(this.canvasRef);
    this.canvasDrawer?.setElements(this.canvasRef, this.imageCanvasRef);

    this.route.params.subscribe((params) => {
      this.menuId = params['menuId'];
      this.userId = params['userId'];
      this.service
        .getMenu(this.menuId!, this.userId!)
        .subscribe((menu: Menu) => {
          this.menu = this.processMenu(menu);

          if (!this.menu.state) {
            return;
          }
          this.menuProvider.setMenu(menu);

          this.pages = this.initializePages(menu);
          this.pagesProvider.setPages(this.pages);

          if (this.menu.state == 12) {
            // Reviewed
            this.mode.switchToView();
          }

          if (this.menu.state < 10) {
            this.translate
              .get('menu.edit.not_processed_warning')
              .subscribe((message) => {
                // this.dialog.open(NotificationDialog, {
                //   width: '350px',
                //   data: message,
                // });
              });
          } else if (this.menu.state == 10) {
            this.translate.get('menu.edit.processed').subscribe((message) => {
              // this.dialog.open(NotificationDialog, {
              //   width: '350px',
              //   data: message,
              // });
            });
          }
        });
    });
  }

  initializePages(menu: Menu) {
    let pages = Array(menu.pagesCount).fill(null);
    let promises: any[] = [];
    if (!menu.originalFileUrl || !this.menu?.pagesCount) {
      return pages;
    }
    getDocument(menu.originalFileUrl).promise.then((pdf) => {
      for (let i = 0; i < menu.pagesCount!; i++) {
        let promise = pdf.getPage(i + 1).then((page) => {
          this.pages[i] = page;
        });
        promises.push(promise);
      }

      Promise.all(promises).then(() => {
        this.pageEvent.pageIndex = 0;
        this.changePage(this.pageEvent);
      });
    });
    return pages;
  }

  processMenu(menu: Menu) {
    if (!menu.stopStyle) {
      menu.stopStyle = 'underline';
      menu.stopColor = '#ABC123';
    }

    if (!menu.markups) {
      return menu;
    }

    menu.markups.forEach((markup) => {
      let originalMarkup: any[] = [];
      markup.forEach((line) => {
        line = this.lineController.initializeLine(line);
        originalMarkup.push({
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2,
          text: line.text,
          tag: line.tag,
          children: line.children,
        } as MenuLine);
      });
      if (!this.originalMenu.markups) {
        this.originalMenu.markups = [];
      }
      this.originalMenu.markups.push(originalMarkup);
    });

    return menu;
  }

  onColorChange(event: any) {
    this.redrawCanvas();
  }

  changePage(event: PageEvent) {
    this.lineController.deselectAll();
    this.page.changePage(event.pageIndex);
    this.redrawCanvas(true);
  }

  flatChildrenLines(line: MenuLine) {
    if (!line.children || line.children.length == 0) {
      return [line];
    } else {
      let result: any[] = [];
      line.children.forEach((l) => {
        let children = this.flatChildrenLines(l);
        children.forEach((c) => result.push(c));
      });
      return result;
    }
  }

  saveMarkup() {
    var menuMarkupToUpload: any[] = [];
    this.menu?.markups?.forEach((markup) => {
      let lines: any[] = [];
      markup.forEach((line) => {
        let box = [
          [line.x1, line.y1],
          [line.x2, line.y2],
        ];
        let text = line.text;
        let children = [];
        if (line.children && line.children.length > 0) {
          children = this.flatChildrenLines(line);
        }
        lines.push({ text: text, box: box, tag: line.tag, children: children });
      });
      menuMarkupToUpload.push(lines);
    });
    this.saveDisabled = true;
    let updateRequest = {
      markup: menuMarkupToUpload,
      deletedLines: this.lineController.deletedLines,
      stopStyle: this.menu!.stopStyle,
      stopColor: this.menu!.stopColor,
    };
    this.service
      .uploadMarkup(this.menuId!, this.userId!, updateRequest)
      .subscribe(
        (r: any) => {
          this.saveDisabled = false;
          this.snackBar.open(this.markupedSavedMessage, this.closeText, {
            duration: 2 * 1000,
          });
          this.lineController.deletedLines = [];
        },
        (r: any) => {
          this.saveDisabled = false;
          this.snackBar.open(r, '', {
            duration: 5 * 1000,
          });
        }
      );
  }

  deleteMarkup() {
    this.translate.get('markup.delete_confirmation').subscribe((text) => {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '350px',
        data: { message: text },
      });

      dialogRef.componentInstance.callback.subscribe(() => {
        this.service.deleteMarkup(this.menuId!).subscribe(
          (r: any) => {
            dialogRef.componentInstance.close();
            this.router.navigate(['menus']);
          },
          (e: any) => {
            // this.notify.error(JSON.stringify(e));
            dialogRef.componentInstance.close();
          }
        );
      });
    });
  }

  toViewMode() {
    this.mode.switchToView();
    this.redrawCanvas();
  }

  toEditMode() {
    this.mode.switchToEdit();
    this.redrawCanvas();
  }

  removeLine(line: MenuLine) {
    this.lineController.removeLine(line);
    this.redrawCanvas();
  }

  selectAll() {
    this.lineController.selectAll();
    this.redrawCanvas();
  }

  deselectAll() {
    this.lineController.deselectAll();
    this.redrawCanvas();
  }

  deleteSelected() {
    this.lineController.deleteSelected();
    this.redrawCanvas();
  }

  addLine(index: number) {
    this.lineController.addLine(index);
    this.redrawCanvas();
  }

  mergeSelection() {
    this.lineController.mergeSelection();
    this.redrawCanvas();
  }

  onLineSelected(event: any) {
    this.redrawCanvas();
  }

  onCoordChange(event: any, line: MenuLine, lineIndex: number, prop: any) {
    this.lineController.onCoordChange(event, line, lineIndex, prop);
    this.redrawCanvas();
  }

  redrawCanvas(changePage: boolean = false) {
    this.canvasDrawer?.redrawCanvas(
      this.canvasController!.selectionBox,
      changePage
    );
  }

  resetMarkup() {
    let originalMarkup: any[] = [];
    if (!this.originalMenu.markups) {
      return;
    }
    this.originalMenu.markups[this.page.current].forEach((l: MenuLine) => {
      originalMarkup.push({
        x1: l.x1,
        y1: l.y1,
        x2: l.x2,
        y2: l.y2,
        text: l.text,
        tag: l.tag,
        children: l.children,
      } as MenuLine);
    });
    this.menu!.markups![this.page.current] = originalMarkup;
  }

  rollback() {
    this.lineController.rollback();
    this.redrawCanvas();
  }

  zoomIn() {
    if (this.canvasHeight >= 150) {
      return;
    }
    this.canvasHeight += ZOOM_INCREMENT;
    this.canvasDrawer?.incrementScale();
    this.redrawCanvas(true);
  }

  zoomOut() {
    if (this.canvasHeight - ZOOM_INCREMENT <= 50) {
      return;
    }
    this.canvasHeight -= ZOOM_INCREMENT;
    this.canvasDrawer?.decrementScale();
    this.redrawCanvas(true);
  }

  openHelp() {
    this.dialog.open(TutorialComponent, {
      width: '550px',
      data: { tutorial_id: 'markup', simple: true },
    });
  }
}
