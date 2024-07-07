import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';
import { environment } from '../../environments/environment';
import { Globals } from '../globals';
import { Menu, Restaurant } from '../api/model/models';

@Injectable()
export class QrMenuService {
  jwt: string | null = null;
  qrMenus: Observable<QrMenu[] | HttpEvent<QrMenu[]>> | null = null;
  qrMenuValues: QrMenu[] | null = null;

  constructor(
    public globals: Globals,
    private http: HttpClient,
    private cookie: CookieService
  ) {}

  create(qrMenuFormData: any) {
    this.clearCache();
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.jwt,
      }),
    };
    return this.http.post(
      environment.apiUrl + '/api/CreateQrMenu',
      qrMenuFormData,
      options
    );
  }

  update(qrMenuFormData: any, id: string) {
    this.clearCache();
    const options = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.jwt,
      }),
    };
    return this.http.post(
      environment.apiUrl + '/api/UpdateQrMenu/' + id,
      qrMenuFormData,
      options
    );
  }

  updateStopList(id: string, stopLists: string[][]) {
    return this.http.post(
      environment.apiUrl + '/api/UpdateStopLists/' + id,
      stopLists,
      this.createHttpOptions()
    );
  }

  list() {
    if (this.globals.role != 'client') {
      return;
    }
    if (!this.qrMenus) {
      this.qrMenus = this.http.get<QrMenu[]>(
        environment.apiUrl + '/api/codes',
        this.createHttpOptions()
      );
      this.qrMenus.subscribe((data: QrMenu[] | HttpEvent<QrMenu[]>) => {
        this.qrMenuValues = data as QrMenu[];
        this.globals.qrMenusCount = this.qrMenuValues.length;
      });
    }
    return this.qrMenus;
  }

  clearCache() {
    this.qrMenus = null;
    this.qrMenuValues = null;
  }

  delete(id: string) {
    this.clearCache();
    return this.http.post(
      environment.apiUrl + '/api/DeleteQrMenu/' + id,
      {},
      this.createHttpOptions()
    );
  }

  getMenu(qrMenuId: string, userId: string): Observable<QrMenu> {
    if (this.qrMenuValues) {
      var match = this.qrMenuValues.filter(
        (menu: QrMenu) => menu.id == qrMenuId
      );
      if (match.length > 0) {
        return of(match[0]);
      }
    }
    return this.getGetMenuFromService(qrMenuId, userId);
  }

  getGetMenuFromService(qrMenuId: string, userId: string) {
    return this.http.get<QrMenu>(
      environment.apiUrl + '/api/ShowQrMenu/' + userId + '/' + qrMenuId
    );
  }

  getMenuRoutingParams(urlSuffix: string) {
    return this.http.get<QrRoutingParams>(
      environment.apiUrl + '/api/GetRoutingParams/' + urlSuffix
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

export class QrMenuCreationRequest {
  constructor(
    public name: string,
    public restId: string,
    public description: string,
    public menuItems: QrMenuItem[]
  ) {}
}

export class QrMenuItem {
  constructor(public name: string, public menuId: string) {}
}

export class QrMenuEntity {
  constructor(
    public name: string,
    public restId: string,
    public description: string,
    public menuItems: string
  ) {}
}

export class QrMenu {
  public id: string = '';
  public scansCount: number = 0;
  public stopLists: string[][] = [];
  public stopMarkup: any[][][] = [];

  constructor(
    public name: string,
    public displayName: string,
    public restaurant: Restaurant | null,
    public menuItems: QrItem[],
    public primaryColor: string,
    public secondaryColor: string,
    public fontColor: string,
    public urlSuffix: string = '',
    public hideSections: string[] = [],
    public restaurantId: string = '',
    public previewIndex: number = -1
  ) {}
}

export class QrItem {
  public entity: any;
  public images: string[] = [];
  public menuCompressed: boolean = false;
  public pagesCount: number = 0;
  public menu: Menu | null = null;

  constructor(
    public menuId: string,
    public title: string,
    public thumbnailIndex: number,
    public originalFileUrl: string = ''
  ) {}
}

export class Code {
  constructor(
    public rowKey: string,
    public name: string,
    public restId: string,
    public restName: string,
    public displayName: string,
    public menuItems: any
  ) {}
}

export class QrRoutingParams {
  constructor(public userId: string, public qrMenuId: string) {}
}
