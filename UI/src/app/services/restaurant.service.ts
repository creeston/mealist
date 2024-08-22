import { HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { Globals } from '../globals';
import { RestaurantsService } from '../api/api/restaurants.service';
import { Restaurant } from '../api';

@Injectable()
export class RestaurantService {
  jwt: string | null = 'JWT';
  restaurants$: Observable<Restaurant[] | HttpEvent<Restaurant[]>> | null =
    null;
  restaurantValues: Restaurant[] | null = null;

  constructor(public globals: Globals, private api: RestaurantsService) {}

  createRestaurant(rest: Restaurant) {
    return firstValueFrom(this.api.createRestaurant(rest));
  }

  getRestaurantImage(rest: Restaurant) {
    return new Observable<string>();
    // return this.http.post(
    //   environment.apiUrl + '/api/GetRestaurantMapLocation',
    //   rest,
    //   this.createHttpOptions()
    // );
  }

  updateRestaurant(rest: Restaurant, id: string) {
    return firstValueFrom(this.api.updateRestaurant(id, rest));
  }

  listRestaurants() {
    if (!this.restaurants$) {
      this.restaurants$ = this.api.getRestaurants();

      this.restaurants$.subscribe((rests) => {
        this.restaurantValues = rests as Restaurant[];
        this.globals.restsCount = this.restaurantValues.length;
      });
    }
    return this.restaurants$;
  }

  async deleteRestaurant(id: string) {
    await firstValueFrom(this.api.deleteRestaurant(id));
    this.clearCache();
  }

  createHttpOptions(): any {
    if (this.jwt) {
      return {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.jwt,
        }),
      };
    } else {
      throw new Error('JWT token not found in cookies');
    }
  }

  clearCache() {
    this.restaurants$ = null;
  }
}
