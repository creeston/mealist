import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialog } from '../confirmation-dialog/confirmation-dialog';
import { CreateRestaurantDialog } from '../create-restaurant/create-restaurant.component';
import {
  Restaurant,
  RestaurantService,
} from '../../services/restaurant.service';
import { ScreenService } from '../../services/screen.service';
import { TranslateHelperClass } from '../../services/translate-helper.service';

@Component({
  selector: 'rest-item',
  templateUrl: './rest-item.html',
  styleUrls: ['./rest-item.css'],
})
export class RestItemComponent implements OnInit {
  @Input()
  public rest!: Restaurant;

  @Output()
  public loading = new EventEmitter<boolean>();

  @Output()
  public onRestDeleted = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    public screen: ScreenService,
    private service: RestaurantService,
    private translate: TranslateService,
    public translateHelper: TranslateHelperClass
  ) {}

  ngOnInit(): void {}

  deleteRestaurant(rest: Restaurant) {
    this.translate.get('rest.delete_confirmation').subscribe((text) => {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '350px',
        panelClass: 'mat-dialog-confirmation-container',
        data: { message: text + ' "' + rest.name + '"?' },
      });

      dialogRef.componentInstance.callback.subscribe((e) => {
        this.service.deleteRestaurant(rest.rowKey).subscribe(
          (r: any) => {
            dialogRef.componentInstance.close();
            this.onRestDeleted.emit();
          },
          (error: any) => {
            // this.notify.error(JSON.stringify(error));
          }
        );
      });
    });
  }

  editRest(rest: Restaurant) {
    const dialogRef = this.dialog.open(CreateRestaurantDialog, {
      width: Math.min(450, screen.height) + 'px',
      data: rest,
    });
    dialogRef.afterClosed().subscribe((result: Restaurant) => {
      if (result) {
        this.rest = result;
        if (this.rest.mapsView) {
          this.rest.mapsView =
            this.rest.mapsView + '&ts=' + new Date().getTime();
        }
      }
    });
  }

  checkOverflow(element: any) {
    return element.offsetWidth < element.scrollWidth;
  }
}
