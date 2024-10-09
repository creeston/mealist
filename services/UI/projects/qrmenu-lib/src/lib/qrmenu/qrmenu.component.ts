import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { QrMenuSpecification } from '../../models/qrmenu-specification';
import { MenuSpecification } from '../../models/menu-specification';
import { GradientBorderComponent } from '../gradient-border/gradient-border.component';
import { CommonModule } from '@angular/common';
import { QrMenuHeader } from '../qrmenu-header/qrmenu-header.component';
import { QrmenuItemComponent } from '../qrmenu-item/qrmenu-item.component';
import { MenuViewerComponent } from '../menu-viewer/menu-viewer.component';

@Component({
  selector: 'app-qr-menu',
  templateUrl: './qrmenu.component.html',
  styleUrls: ['./qrmenu.component.scss'],
  standalone: true,
  imports: [
    GradientBorderComponent,
    CommonModule,
    QrMenuHeader,
    QrmenuItemComponent,
    MenuViewerComponent,
  ],
})
export class QrMenuComponent {
  @Input({ required: true })
  qrMenu!: QrMenuSpecification;

  @Input({ required: true })
  previewMode!: boolean;

  @ViewChild('container')
  container!: ElementRef;

  urlSuffix: string | undefined;
  selectedMenu: MenuSpecification | undefined = undefined;
  imagesData: any[] = [];
  loading = false;

  setMenuColors(qrMenu: QrMenuSpecification) {
    if (!qrMenu.style.headerColor) {
      qrMenu.style.headerColor = '#3f51b5';
    }
    if (!qrMenu.style.actionsColor) {
      qrMenu.style.actionsColor = '#3f51b5c0';
    }
    if (!qrMenu.style.fontColor) {
      qrMenu.style.fontColor = '#ffffff';
    }
    if (!qrMenu.style.backgroundColor) {
      qrMenu.style.backgroundColor = '#ffffff';
    }
  }

  openMenu(menuItem: MenuSpecification) {
    this.imagesData = [];
    for (let pageId = 0; pageId < menuItem.pages!.length; pageId++) {
      this.imagesData.push({ width: 0, height: 0 });
    }
    this.selectedMenu = menuItem;
  }

  back() {
    this.selectedMenu = undefined;
  }

  backClicked() {
    this.container.nativeElement.scrollTop = 0;
    this.back();
  }

  menuSelected(menu: MenuSpecification) {
    this.container.nativeElement.scrollTop = 0;
    this.openMenu(menu);
  }
}
