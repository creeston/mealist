import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Pipe, PipeTransform } from '@angular/core';
import { Meal } from '../../services/menu.service';
import { QrMenu, QrMenuService } from '../../services/qrmenu.service';
import { ScreenService } from '../../services/screen.service';
@Component({
  selector: 'app-edit-meals',
  templateUrl: './edit-meals.component.html',
  styleUrls: ['./edit-meals.component.css'],
})
export class EditMealsComponent implements OnInit {
  @ViewChild('layout') canvasRef: any;
  currentImage: string = '';
  meals: Meal[] = [];
  menu: QrMenu | null = null;
  currentMeals: Meal[] = [];
  menuItems: any[] = [];
  menuMeals: any[] = [];
  currentMenuId: number = 0;
  pageEvent: PageEvent = new PageEvent();
  searchPattern: string = '';

  saveDisabled = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditMealsComponent>,
    private service: QrMenuService,
    public screen: ScreenService
  ) {}

  displayedColumns = ['position', 'name', 'presence'];

  ngOnInit(): void {
    this.menuMeals = this.data.menuMeals;
    this.menu = this.data.menu;
    for (let pageId = 0; pageId < this.menuMeals.length; pageId++) {
      let stopList = this.menu!.stopLists[pageId];
      this.menuMeals[pageId].meals.forEach((m: any) => {
        if (stopList.indexOf(m.text) >= 0) {
          m.enabled = false;
        }
      });
    }
    this.currentMenuId = 0;
  }

  onSearchChanged(event: any) {
    if (this.searchPattern) {
      this.currentMeals = this.meals.filter((m) =>
        m.text.startsWith(this.searchPattern)
      );
    } else {
      this.currentMeals = this.meals;
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    this.saveDisabled = true;
    let stopLists: string[][] = [];
    this.menuMeals.forEach((menu) => {
      let meals = menu.meals;
      let disabledMeals = meals
        .filter((m: any) => !m.enabled)
        .map((m: any) => m.text);
      stopLists.push(disabledMeals);
    });
    this.service.updateStopList(this.data.menu.id, stopLists).subscribe(
      (r) => {
        this.saveDisabled = false;
        this.dialogRef.close(stopLists);
      },
      (e) => {
        // this.notify.error(e);
        this.saveDisabled = false;
      }
    );
  }
}

@Pipe({
  name: 'searchfilter',
  pure: false,
})
export class SearchFilterPipe implements PipeTransform {
  transform(items: any[], filter: Object): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter((item) => item.text.indexOf(filter) !== -1);
  }
}
