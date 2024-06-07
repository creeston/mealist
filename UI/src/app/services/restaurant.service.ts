import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, catchError, of, tap } from 'rxjs';
import { Globals } from '../globals';
import { environment } from '../../environments/environment';

@Injectable()
export class RestaurantService {
  jwt: string | null = null;
  restaurants$: Observable<Restaurant[] | HttpEvent<Restaurant[]>> | null =
    null;
  restaurantValues: Restaurant[] | null = null;

  constructor(
    public globals: Globals,
    private http: HttpClient,
    private cookie: CookieService
  ) {}

  createRestaurant(rest: Restaurant) {
    return this.http.post(
      environment.apiUrl + '/api/CreateRestaurant',
      rest,
      this.createHttpOptions()
    );
  }

  getRestaurantImage(rest: Restaurant) {
    return this.http.post(
      environment.apiUrl + '/api/GetRestaurantMapLocation',
      rest,
      this.createHttpOptions()
    );
  }

  updateRestaurant(rest: Restaurant) {
    return this.http.post(
      environment.apiUrl + '/api/UpdateRestaurant',
      rest,
      this.createHttpOptions()
    );
  }

  listRestaurants() {
    if (this.globals.role != 'client') {
      return;
    }
    if (!this.restaurants$) {
      this.restaurants$ = this.http
        .post<Restaurant[]>(
          environment.apiUrl + '/api/ListRestaurants',
          {},
          this.createHttpOptions()
        )
        .pipe(
          tap((data) => data),
          catchError(() => of([]))
        );

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
    return this.http.post(
      environment.apiUrl + '/api/DeleteRestaurant/' + restId,
      {},
      this.createHttpOptions()
    );
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

export interface Restaurant {
  rowKey: string;
  name: string;
  address: string;
  city: string;
  description: string;
  wifiName?: string | null;
  wifiPassword?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tripAdvisorUrl?: string;
  vkUrl?: string;
  mapsView?: string;
}
