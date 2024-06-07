import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CreateRestaurantDialog } from '../create-restaurant/create-restaurant.component';
import {
  Restaurant,
  RestaurantService,
} from '../../services/restaurant.service';
import { Globals } from '../../globals';
import { ScreenService } from '../../services/screen.service';

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
  ) {}

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
    const dialogRef = this.dialog.open(CreateRestaurantDialog, {
      width: '450px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refresh();
      }
    });
  }

  onRestDeleted(rest: Restaurant) {
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
