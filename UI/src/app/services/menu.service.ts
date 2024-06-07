import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { Globals } from '../globals';
import { environment } from '../../environments/environment';

@Injectable()
export class MenuService {
  jwt: string | null = null;
  menus: Observable<Menu[] | HttpEvent<Menu[]>> | null = null;
  menuValues: Menu[] | null = null;

  constructor(
    public globals: Globals,
    private http: HttpClient,
    private cookie: CookieService
  ) {}

  createMenu(file: any, menu: Menu) {
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.jwt,
      }),
    };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('menu', JSON.stringify(menu));
    return this.http.post(
      environment.pythonUrl + '/api/CreateMenu',
      formData,
      options
    );
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

  listMenus() {
    if (!this.menus) {
      this.menus = this.http.post<Menu[]>(
        environment.apiUrl + '/api/ListMenus',
        {},
        this.createHttpOptions()
      );
      this.menus.subscribe((menus) => {
        this.menuValues = menus as Menu[];
        this.globals.menusCount = this.menuValues.length;
      });
    }
    return this.menus;
  }

  clearCache() {
    this.menus = null;
    this.menuValues = null;
  }

  deleteMenu(menuId: string) {
    this.clearCache();
    return this.http.post(
      environment.apiUrl + '/api/DeleteMenu/' + menuId,
      {},
      this.createHttpOptions()
    );
  }

  getMenu(menuId: string, userId: string) {
    if (!userId) {
      return this.http.get<Menu>(
        environment.apiUrl + '/api/ShowMenu/' + menuId,
        <Object>this.createHttpOptions()
      );
    } else {
      return this.http.get<Menu>(
        environment.apiUrl + '/api/ShowMenuForReview/' + userId + '/' + menuId,
        <Object>this.createHttpOptions()
      );
    }
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

export class Menu {
  public id: string = '';
  public ownerId: string = '';
  public name: string = '';
  public images: string[] = [];
  public menuCompressed: boolean = false;
  public markups: MenuLine[][] = [];
  public creationDate: Date = new Date();
  public dishesCount: number = 0;
  public pagesCount: number = 0;
  public state: number = 0;
  public parsingProgress: number = 0;
  public previewImageUrl: string = '';
  public originalFileUrl: string = '';
  public stopStyle: string = '';
  public stopColor: string = '';
  public stopListEnabled: boolean = false;
}

export class MenuLine {
  public text: string;
  public tag: string;
  public box: number[][];

  public x1: number;
  public y1: number;
  public x2: number;
  public y2: number;
  public editSelected: boolean;
  public viewSelected: boolean;
  public hover: boolean;
  public children: MenuLine[] = [];

  constructor(line: MenuLine) {
    this.text = line.text;
    this.tag = line.tag;
    this.x1 = line.x1;
    this.x2 = line.x2;
    this.y1 = line.y1;
    this.y2 = line.y2;
    this.editSelected = line.editSelected;
    this.viewSelected = line.viewSelected;
    this.hover = line.hover;
    this.box = [
      [this.x1, this.y1],
      [this.x2, this.y2],
    ];
  }
}

export class Meal {
  pageId: number | null = null;
  lineId: number | null = null;
  text: string = '';
  enabled: boolean = true;
}
