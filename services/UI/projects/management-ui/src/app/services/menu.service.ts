import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Globals } from '../globals';
import { environment } from '../../environments/environment';
import { MenusService } from '../api/api/menus.service';
import { Menu } from '../api/model/menu';
import { MenuPage } from '../api';

@Injectable()
export class MenuService {
  jwt: string | null = 'JWT';

  constructor(
    public globals: Globals,
    private http: HttpClient,
    private api: MenusService
  ) {}

  async createMenu(
    file: Blob,
    menuName: string | undefined,
    language: string | undefined
  ) {
    await firstValueFrom(this.api.createMenu(file, menuName, language));
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
    var menus = await firstValueFrom(this.api.getAllMenus());
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
    const menu = await firstValueFrom(this.api.getMenuById(menuId));
    return menu;
  }

  async updateMenuPages(menuId: string, pages: MenuPage[]) {
    return await firstValueFrom(this.api.updateMenuPages(menuId, pages));
  }

  listMeals(menuId: string) {
    return this.http.get<Meal[]>(
      environment.apiUrl + '/api/ListMeals/' + menuId,
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
