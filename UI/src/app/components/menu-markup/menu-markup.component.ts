import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { TranslateService } from '@ngx-translate/core';
import { TutorialComponent } from '../tutorial/tutorial';
import { MenuService } from '../../services/menu.service';
import { Globals } from '../../globals';
import { Menu } from '../../api';
import { MarkedLine, MarkedMenu, MarkedPage } from './marked-menu';
import {
  BoundingBoxStyle,
  OcrBox,
  OcrDocument,
} from 'ng-ocr-editor/lib/ocr-document';
import { PageProvider } from './providers';

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
  page: PageProvider = new PageProvider();
  ocrDocuments: OcrDocument[] = [];

  @ViewChild('ocrEditor') ocrEditor: any;

  public stopModes = [
    { key: 'underline', value: '' },
    { key: 'stop', value: '' },
  ];

  boxStyle: BoundingBoxStyle = {
    width: 2,
    color: '#000000',
    selectedColor: '#FF0000',
    selectedWidth: 5,
    constastWidth: 2,
    contrastColor: '#FFFFFF',
  };

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
    private translate: TranslateService
  ) {}

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
    this.route.params.subscribe((params) => {
      this.menuId = params['menuId'];
      this.service.getMenu(this.menuId!).then((menu: Menu) => {
        this.originalMenu = menu;
        this.processMenuAsync(menu).then((menu) => {
          this.menu = menu;
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

    this.ocrDocuments = [];

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
        pageMarkup.push(markedLine);
      });

      const imageUrl = page.imageUrl;
      const image = await this.loadImageAsync(imageUrl);

      markedMenu.pages.push({
        pageNumber: page.pageNumber,
        imageUrl: page.imageUrl,
        markup: pageMarkup,
        imageElement: image,
      } as MarkedPage);

      const document = {
        imageElement: image,
        markup: pageMarkup.map((line) => {
          return {
            text: line.text,
            x1: line.x1,
            x2: line.x2,
            y1: line.y1,
            y2: line.y2,
            highlight: false,
            viewStyle: {
              color: '#000000',
              style: 'fill',
            },
          } as OcrBox;
        }),
      } as OcrDocument;

      this.ocrDocuments.push(document);
    }

    return markedMenu;
  }

  async loadImageAsync(imageUrl: string): Promise<HTMLImageElement> {
    let image = new Image();
    image.src = imageUrl;
    return new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(image);
      };
    });
  }

  onColorChange(event: any) {
    // this.redrawCanvas();
  }

  changePage(event: PageEvent) {
    this.page.changePage(event.pageIndex);
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

  openHelp() {
    this.dialog.open(TutorialComponent, {
      width: '550px',
      data: { tutorial_id: 'markup', simple: true },
    });
  }
}
