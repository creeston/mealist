import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Globals } from '../globals';
import { QrMenu } from '../api/model/models';
import { QrmenusService } from '../api';
import { CreateQrMenuRequest } from '../api/model/createQrMenuRequest';

@Injectable()
export class QrMenuService {
  jwt: string | null = null;
  qrMenus: Observable<QrMenu[] | HttpEvent<QrMenu[]>> | null = null;
  qrMenuValues: QrMenu[] | null = null;

  constructor(
    public globals: Globals,
    private http: HttpClient,
    private api: QrmenusService
  ) {}

  async create(creationRequest: CreateQrMenuRequest, file?: Blob) {
    await firstValueFrom(this.api.createQrMenu(file, creationRequest));
  }

  update(qrMenuFormData: any, id: string) {
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
      stopLists
    );
  }

  async list() {
    const qrMenus = await firstValueFrom(this.api.getAllQrMenus());
    this.globals.qrMenusCount = qrMenus.length;
    return qrMenus;
  }

  delete(id: string) {
    return this.http.post(environment.apiUrl + '/api/DeleteQrMenu/' + id, {});
  }

  async getMenu(qrMenuId: string, userId: string): Promise<QrMenu> {
    const qrMenu = await firstValueFrom(this.api.getQrMenuById(qrMenuId));

    return qrMenu;
  }

  getMenuRoutingParams(urlSuffix: string) {
    return this.http.get<QrRoutingParams>(
      environment.apiUrl + '/api/GetRoutingParams/' + urlSuffix
    );
  }
}

export class QrRoutingParams {
  constructor(public userId: string, public qrMenuId: string) {}
}
