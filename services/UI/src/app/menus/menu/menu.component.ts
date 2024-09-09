import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../api';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  public menu: Menu;
  @ViewChild('layout') canvasRef: any;
  currentImage: string;
  pageEvent: PageEvent = new PageEvent();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Menu,
    public dialogRef: MatDialogRef<MenuComponent>,
    private service: MenuService
  ) {
    this.menu = data;
    this.pageEvent.pageIndex = 0;
    this.currentImage = this.menu.pages ? this.menu.pages[0].imageUrl : '';
  }

  ngAfterViewInit() {
    this.changePage(this.pageEvent);
  }

  changePage(event: PageEvent) {
    if (!this.menu.pages) return;
    this.currentImage = this.menu.pages[event.pageIndex].imageUrl;
    let currentMarkup = this.menu.pages[event.pageIndex].markup;
    let canvas = this.canvasRef.nativeElement;
    let context = canvas.getContext('2d');

    let source = new Image();
    source.crossOrigin = 'Anonymous';
    source.src = this.currentImage;
    source.onload = () => {
      canvas.height = source.height;
      canvas.width = source.width;
      context.drawImage(source, 0, 0);
      if (currentMarkup) {
        for (let menuLine of currentMarkup) {
          let text = menuLine.text;
          let box = [
            [menuLine.x1, menuLine.x2],
            [menuLine.y1, menuLine.y2],
          ];
          context.beginPath();
          context.strokeStyle = 'green';
          let x = box[0][0];
          let y = box[0][1];
          let w = box[1][0] - x;
          let h = box[1][1] - y;
          context.rect(x, y, w, h);
          context.stroke();
        }
        this.currentImage = canvas.toDataURL();
      }
    };
  }

  ngOnInit(): void {
    // this.service
    //   .getMenu(this.data.menuId)
    //   .subscribe((r: any) => {
    //     this.menu = r;
    //   });
  }
}
