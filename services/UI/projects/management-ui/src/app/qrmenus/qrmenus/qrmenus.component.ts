import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { QrMenuService } from '../../services/qrmenu.service';
import { RestaurantService } from '../../services/restaurant.service';
import { Globals } from '../../globals';
import { ScreenService } from '../../services/screen.service';
import { QrMenu, Restaurant } from '../../api/model/models';

@Component({
  selector: 'app-qrmenus',
  templateUrl: './qrmenus.component.html',
  styleUrls: ['./qrmenus.component.css'],
})
export class QrMenusComponent implements OnInit {
  public dataLoaded = false;
  public loading = false;
  public qrMenus: QrMenu[] = [];
  public restaurants: Restaurant[] = [];

  constructor(
    public globals: Globals,
    public dialog: MatDialog,
    public screen: ScreenService,
    private router: Router,
    private service: QrMenuService,
    private restService: RestaurantService
  ) {}

  ngOnInit(): void {
    this.restService.listRestaurants().then((restaurants: Restaurant[]) => {
      this.restaurants = restaurants;
      this.refresh();
    });
  }

  ngAfterViewInit(): void {}

  refresh() {
    this.dataLoaded = false;
    this.service
      .list()
      .then((data: QrMenu[] | undefined) => {
        if (!data) {
          return;
        }
        this.qrMenus = data;
      })
      .finally(() => {
        this.dataLoaded = true;
      });
  }

  createCode() {
    this.router.navigate(['qrmenu-create']);
  }
}
