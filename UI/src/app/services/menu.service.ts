import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Globals } from '../globals';
import { environment } from '../../environments/environment';
import { MenusService } from '../api/api/menus.service';
import { Menu } from '../api/model/menu';

@Injectable()
export class MenuService {
  jwt: string | null = 'JWT';

  constructor(
    public globals: Globals,
    private http: HttpClient,
    private api: MenusService
  ) {}

  async createMenu(file: Blob, menuName: string | undefined) {
    await firstValueFrom(this.api.createMenu(file, menuName));
  }

  getMenuState(menuId: string) {
    return this.http.get<Menu>(
      environment.apiUrl + '/api/GetMenu/' + menuId,
      this.createHttpOptions()
    );
  }

  requestMenuReview(menuId: string) {
    return this.http.post<Menu>(
      environment.apiUrl + '/api/RequestMenuReview/' + menuId,
      {},
      this.createHttpOptions()
    );
  }

  async listMenus() {
    var menus = await firstValueFrom(this.api.getMenus());
    this.globals.menusCount = menus.length;
    return menus;
  }

  deleteMenu(menuId: string) {
    return this.http.post(
      environment.apiUrl + '/api/DeleteMenu/' + menuId,
      {},
      this.createHttpOptions()
    );
  }

  async getMenu(menuId: string) {
    const menu = await firstValueFrom(this.api.getMenu(menuId));
    return menu;
  }

  uploadMarkup(menuId: string, userId: string, menuMarkup: any) {
    let endpoint = '';
    if (userId) {
      endpoint =
        environment.apiUrl +
        '/api/UploadReviewedMarkup/' +
        userId +
        '/' +
        menuId;
    } else {
      endpoint = environment.apiUrl + '/api/UploadMarkup/' + menuId;
    }
    return this.http.post(endpoint, menuMarkup, this.createHttpOptions());
  }

  deleteMarkup(menuId: string) {
    return this.http.post(
      environment.apiUrl + '/api/DeleteMarkup/' + menuId,
      {},
      this.createHttpOptions()
    );
  }

  listMeals(menuId: string) {
    return this.http.get<Meal[]>(
      environment.apiUrl + '/api/ListMeals/' + menuId,
      this.createHttpOptions()
    );
  }

  triggerFeature(menuId: string, feature: string) {
    return this.http.post<Menu>(
      environment.apiUrl + `/api/TriggerFeature/${menuId}/${feature}`,
      {},
      this.createHttpOptions()
    );
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
}

export class Meal {
  pageId: number | null = null;
  lineId: number | null = null;
  text: string = '';
  enabled: boolean = true;
}
