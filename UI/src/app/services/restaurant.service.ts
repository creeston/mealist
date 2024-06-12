import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, catchError, of, tap } from 'rxjs';
import { Globals } from '../globals';
import { environment } from '../../environments/environment';
import { RestaurantsService } from '../api/api/restaurants.service';
import { Restaurant } from '../api';

@Injectable()
export class RestaurantService {
  jwt: string | null = null;
  restaurants$: Observable<Restaurant[] | HttpEvent<Restaurant[]>> | null =
    null;
  restaurantValues: Restaurant[] | null = null;

  constructor(
    public globals: Globals,
    private cookie: CookieService,
    private api: RestaurantsService
  ) {}

  createRestaurant(rest: Restaurant) {
    return this.api.createRestaurant({
      address: rest.address,
      city: rest.city,
      description: rest.description,
      facebookUrl: rest.facebookUrl,
      instagramUrl: rest.instagramUrl,
      vkUrl: rest.vkUrl,
      tripAdvisorUrl: rest.tripAdvisorUrl,
      name: rest.name,
      wifiName: rest.wifiName ?? '',
      wifiPassword: rest.wifiPassword,
    });

    // return this.http.post(
    //   environment.apiUrl + '/api/restaurants',
    //   rest,
    //   this.createHttpOptions()
    // );
  }

  getRestaurantImage(rest: Restaurant) {
    return new Observable<string>();
    // return this.http.post(
    //   environment.apiUrl + '/api/GetRestaurantMapLocation',
    //   rest,
    //   this.createHttpOptions()
    // );
  }

  updateRestaurant(rest: Restaurant) {
    if (!rest.id) throw new Error('Restaurant ID is required');
    return this.api.updateRestaurant(rest.id, rest);
  }

  listRestaurants() {
    if (!this.restaurants$) {
      this.restaurants$ = this.api.getRestaurants();

      // this.restaurants$ = this.http
      //   .get<Restaurant[]>(
      //     environment.apiUrl + '/api/restaurants',
      //     this.createHttpOptions()
      //   )
      //   .pipe(
      //     tap((data) => data),
      //     catchError(() => of([]))
      //   );

      this.restaurants$.subscribe((rests) => {
        this.restaurantValues = rests as Restaurant[];
        this.globals.restsCount = this.restaurantValues.length;
      });
    }
    return this.restaurants$;
  }

  clearCache() {
    this.restaurants$ = null;
  }

  deleteRestaurant(restId: string) {
    this.clearCache();
    return new Observable<{}>();
    // return this.http.delete(
    //   environment.apiUrl + '/api/restaurants/' + restId,
    //   this.createHttpOptions()
    // );
  }

  createHttpOptions(): any {
    this.jwt = this.cookie.get('ApiJwt');
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
}
