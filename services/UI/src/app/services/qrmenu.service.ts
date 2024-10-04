import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Globals } from '../globals';
import { QrMenu, UpdateQrMenuRequest } from '../api/model/models';
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

  async update(id: string, updateRequest: UpdateQrMenuRequest, file?: Blob) {
    await firstValueFrom(this.api.updateQrMenu(id, file, updateRequest));
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

  async delete(id: string) {
    return await firstValueFrom(this.api.deleteQrMenu(id));
  }

  async getMenu(qrMenuId: string): Promise<QrMenu> {
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
