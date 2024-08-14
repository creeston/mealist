import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MarkedLine, MarkedMenu, MarkedPage } from './marked-menu';

const ZOOM_INCREMENT = 25;

@Component({
  selector: 'app-menu-markup',
  templateUrl: './menu-markup.component.html',
  styleUrls: ['./menu-markup.component.scss'],
})
export class MenuMarkupComponent implements OnInit {
  canvasHeight: number = 80;

  menu: MarkedMenu | null = null;
  menuId: string | null = null;
  userId: string | null = null;
  originalMenu: Menu = {} as Menu;

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
      this.service
        .getMenu(this.menuId!)
        .then((menu: Menu) => {
          this.originalMenu = menu;
          this.processMenuAsync(menu).then((menu) => {
            this.menu = menu;
            this.menuProvider.setMenu(this.menu);
            this.pagesProvider.setPages(this.menu.pages);
            this.toEditMode();
          });
        });
    });
  }

  async processMenuAsync(menu: Menu) {
    const markedMenu = {
      menuId: menu.id,
      name: menu.name,
      pages: [],
      stopStyle: menu.stopStyle,
      stopColor: menu.stopColor,
    } as MarkedMenu;

    if (!markedMenu.stopStyle) {
      markedMenu.stopStyle = 'underline';
      markedMenu.stopColor = '#ABC123';
    }

    if (!menu.pages) {
      return markedMenu;
    }

    for (let page of menu.pages) {
      const pageMarkup: MarkedLine[] = [];

      page.markup!.forEach((line) => {

        const markedLine = {
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2,
          text: line.text,
          children: [],
          editSelected: false,
          viewSelected: false,
          hover: false,
        } as MarkedLine;
        this.lineController.initializeLine(markedLine);
        pageMarkup.push(markedLine);
      });

      const imageUrl = page.imageUrl;
      const image = await this.loadImageAsync(imageUrl);

      markedMenu.pages.push({
        pageNumber: page.pageNumber,
        imageUrl: page.imageUrl,
        markup: pageMarkup,
        imageElement: image
      } as MarkedPage);
    }

    return markedMenu;
  }

  async loadImageAsync(imageUrl: string): Promise<HTMLImageElement> {
    let image = new Image();
    image.src = imageUrl;
    return new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(image);
      }
    });
  }

  onColorChange(event: any) {
    this.redrawCanvas();
  }

  changePage(event: PageEvent) {
    this.lineController.deselectAll();
    this.page.changePage(event.pageIndex);
    this.redrawCanvas(true);
  }

  flatChildrenLines(line: MarkedLine) {
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
    // var menuMarkupToUpload: any[] = [];
    // this.menu?.markups?.forEach((markup) => {
    //   let lines: any[] = [];
    //   markup.forEach((line) => {
    //     let box = [
    //       [line.x1, line.y1],
    //       [line.x2, line.y2],
    //     ];
    //     let text = line.text;
    //     let children = [];
    //     if (line.children && line.children.length > 0) {
    //       children = this.flatChildrenLines(line);
    //     }
    //     lines.push({ text: text, box: box, tag: line.tag, children: children });
    //   });
    //   menuMarkupToUpload.push(lines);
    // });
    // this.saveDisabled = true;
    // let updateRequest = {
    //   markup: menuMarkupToUpload,
    //   deletedLines: this.lineController.deletedLines,
    //   stopStyle: this.menu!.stopStyle,
    //   stopColor: this.menu!.stopColor,
    // };
    // this.service
    //   .uploadMarkup(this.menuId!, this.userId!, updateRequest)
    //   .subscribe(
    //     (r: any) => {
    //       this.saveDisabled = false;
    //       this.snackBar.open(this.markupedSavedMessage, this.closeText, {
    //         duration: 2 * 1000,
    //       });
    //       this.lineController.deletedLines = [];
    //     },
    //     (r: any) => {
    //       this.saveDisabled = false;
    //       this.snackBar.open(r, '', {
    //         duration: 5 * 1000,
    //       });
    //     }
    //   );
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

  removeLine(line: MarkedLine) {
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
    this.processMenuAsync(this.originalMenu).then((menu) => {
      this.menuProvider.setMenu(menu);
    });
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
