import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialog } from '../../components/confirmation-dialog/confirmation-dialog';
import { RestaurantFormDialog } from '../restaurant-form/restaurant-form.component';
import { RestaurantService } from '../../services/restaurant.service';
import { ScreenService } from '../../services/screen.service';
import { TranslateHelperClass } from '../../services/translate-helper.service';
import { Restaurant } from '../../api/model/models';
import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-restaurant-card',
  templateUrl: './restaurant-card.component.html',
  styleUrls: ['./restaurant-card.component.css'],
})
export class RestaurantCardComponent implements OnInit {
  @Input()
  public restaurant!: Restaurant;

  @Output()
  public loading = new EventEmitter<boolean>();

  @Output()
  public onRestDeleted = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    public screen: ScreenService,
    private service: RestaurantService,
    private translate: TranslateService,
    public translateHelper: TranslateHelperClass,
  ) { }

  ngOnInit(): void {
  }

  deleteRestaurant(rest: Restaurant) {
    this.translate.get('rest.delete_confirmation').subscribe((text) => {
      const dialogRef = this.dialog.open(ConfirmationDialog, {
        width: '350px',
        panelClass: 'mat-dialog-confirmation-container',
        data: { message: text + ' "' + rest.name + '"?' },
      });

      dialogRef.componentInstance.callback.subscribe(async (e) => {
        await this.service.deleteRestaurant(rest.id!);
        dialogRef.componentInstance.close();
        this.onRestDeleted.emit();
      });
    });
  }

  editRestaurant(rest: Restaurant) {
    const dialogRef = this.dialog.open(RestaurantFormDialog, {
      width: Math.min(550, screen.width) + 'px',
      data: rest,
    });
    dialogRef.afterClosed().subscribe((result: Restaurant) => {
      if (result) {
        this.restaurant = result;
        if (this.restaurant.mapsView) {
          this.restaurant.mapsView =
            this.restaurant.mapsView + '&ts=' + new Date().getTime();
        }
      }
    });
  }

  checkOverflow(element: any) {
    return element.offsetWidth < element.scrollWidth;
  }
}
