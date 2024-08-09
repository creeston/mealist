import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { RestaurantFormDialog } from '../restaurant-form/restaurant-form.component';
import { RestaurantService } from '../../services/restaurant.service';
import { Globals } from '../../globals';
import { ScreenService } from '../../services/screen.service';
import { Restaurant } from '../../api/model/models';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.css'],
})
export class RestaurantsComponent implements OnInit {
  public dataLoaded = false;
  public restaurants: Restaurant[] = [];
  public loading = false;

  constructor(
    public globals: Globals,
    public dialog: MatDialog,
    private router: Router,
    private service: RestaurantService,
    private cookie: CookieService,
    public screen: ScreenService
  ) { }

  ngOnInit(): void {
    let jwt = this.cookie.get('ApiJwt');
    if (jwt) {
      this.refresh();
    } else {
      // this.router.navigate(['/login']);
      return;
    }
  }

  forceRefresh() {
    this.service.clearCache();
    this.refresh();
  }

  refresh() {
    this.dataLoaded = false;
    this.service.listRestaurants()?.subscribe((data: any) => {
      this.restaurants = data;
      this.dataLoaded = true;
    });
  }

  createRestaurant() {
    const dialogRef = this.dialog.open(RestaurantFormDialog, {
      width: '550px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    });
  }

  onRestaurantDeleted(rest: Restaurant) {
    const index = this.restaurants.indexOf(rest, 0);
    this.restaurants.splice(index, 1);
    this.silentRefresh();
  }

  silentRefresh() {
    this.service.listRestaurants()?.subscribe((r: any) => {
      this.restaurants = r as Restaurant[];
    });
  }
}
