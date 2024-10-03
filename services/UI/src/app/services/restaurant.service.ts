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

  updateRestaurant(rest: Restaurant, id: string) {
    return firstValueFrom(this.api.updateRestaurant(id, rest));
  }

  async listRestaurants() {
    const result = await firstValueFrom(this.api.getAllRestaurants());
    this.globals.restsCount = result.length;
    return result;
  }

  async deleteRestaurant(id: string) {
    await firstValueFrom(this.api.deleteRestaurant(id));
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
