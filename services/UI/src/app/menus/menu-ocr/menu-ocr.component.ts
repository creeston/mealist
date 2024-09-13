import {
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { TranslateService } from '@ngx-translate/core';
import { TutorialComponent } from '../../components/tutorial/tutorial';
import { MenuService } from '../../services/menu.service';
import { Globals } from '../../globals';
import { Menu, MenuPage } from '../../api';
import {
  BoundingBoxStyle,
  OcrBox,
  OcrDocument,
} from 'ng-ocr-editor/lib/ocr-document';
import { NgOcrEditorComponent } from 'ng-ocr-editor';

@Component({
  selector: 'app-menu-markup',
  templateUrl: './menu-ocr.component.html',
  styleUrls: ['./menu-ocr.component.scss'],
})
export class MenuOcrComponent implements OnInit {
  canvasHeight: number = 80;

  menuId: string | null = null;
  userId: string | null = null;
  menu: Menu = {} as Menu;

  currentPage = 0;
  ocrDocuments: OcrDocument[] = [];

  @ViewChildren(NgOcrEditorComponent)
  ocrEditors!: QueryList<NgOcrEditorComponent>;

  public stopModes = [
    { key: 'underline', value: '' },
    { key: 'stop', value: '' },
  ];

  boxStyle: BoundingBoxStyle = {
    width: 2,
    color: '#000000',
    selectedColor: '#0b454b',
    selectedWidth: 6,
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
    this.translate.get('markup.style.underline').subscribe((text: any) => {
      this.stopModes[0] = { key: 'underline', value: text };
    });

    this.translate.get('markup.style.overflow').subscribe((text: any) => {
      this.stopModes[1] = { key: 'overflow', value: text };
    });

    this.translate.get('close').subscribe((text: any) => {
      this.closeText = text;
    });

    this.translate.get('markup.was_saved').subscribe((text: any) => {
      this.markupedSavedMessage = text;
    });

    this.route.params.subscribe((params: any) => {
      this.menuId = params['menuId'];
      this.service.getMenu(this.menuId!).then((menu: Menu) => {
        this.menu = menu;
        this.processMenuAsync(menu).then((documents) => {
          this.ocrDocuments = documents;
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
    };

    if (!markedMenu.stopStyle) {
      markedMenu.stopStyle = 'underline';
      markedMenu.stopColor = '#ABC123';
    }

    if (!menu.pages) {
      return [];
    }

    const ocrDocuments = [];

    for (let page of menu.pages) {
      const pageMarkup: OcrBox[] =
        page.markup?.map((line) => {
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
        }) ?? [];

      const imageUrl = page.imageUrl;
      const image = await this.loadImageAsync(imageUrl);

      const document = {
        imageElement: image,
        markup: pageMarkup,
      } as OcrDocument;

      ocrDocuments.push(document);
    }

    return ocrDocuments;
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

  changePage(event: PageEvent) {
    this.currentPage = event.pageIndex;
  }

  get ocrEditor() {
    return this.ocrEditors.get(this.currentPage);
  }

  saveMarkup() {
    const pages = this.menu.pages;

    if (!pages) {
      return;
    }

    for (let i = 0; i < this.ocrEditors.length; i++) {
      const editor = this.ocrEditors.get(i);
      if (!editor) {
        continue;
      }
      const document = editor.documentProvider.value;

      if (!document) {
        continue;
      }
      const page = pages[i];

      page.markup = document.markup.map((line) => {
        return {
          x1: line.x1,
          x2: line.x2,
          y1: line.y1,
          y2: line.y2,
          text: line.text,
        };
      });
    }

    this.saveDisabled = true;
    this.service.updateMenuPages(this.menuId!, pages).then(() => {
      this.saveDisabled = false;
    });
  }
  openHelp() {
    this.dialog.open(TutorialComponent, {
      width: '550px',
      data: { tutorial_id: 'markup', simple: true },
    });
  }
}
