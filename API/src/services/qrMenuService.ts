import { QrMenuModel } from '../models/qrmenu';
import { components } from '../presentation/api';
import { QrMenusRepository } from '../repositories/qrMenusRepository';

type QrMenuResponseModel = components['schemas']['QrMenu'];
type CreateQrMenuRequest = components['schemas']['CreateQrMenuRequest'];

export class QrMenuService {
  constructor(private qrMenusRepository: QrMenusRepository) {}

  async createQrMenu(creationRequest: CreateQrMenuRequest): Promise<QrMenuModel> {
    const qrMenu: QrMenuModel = {
      name: creationRequest.name || '',
      displayName: creationRequest.name || '', // Assuming displayName is same as name
      restaurantId: creationRequest.restaurantId,
      primaryColor: creationRequest.primaryColor || '',
      secondaryColor: creationRequest.secondaryColor || '',
      fontColor: creationRequest.fontColor || '',
      scanCount: 0, // Assuming scanCount starts at 0
      stopList: [], // Assuming stopList starts empty
      hideSections: [], // Assuming hideSections starts empty
      previewIndex: creationRequest.previewIndex || 0,
      urlSuffix: creationRequest.urlSuffix || '',
      items:
        creationRequest.items?.map((item) => ({
          menuId: item.menuId,
          title: item.title,
          thumbnailIndex: item.thumbnailIndex,
        })) || [],
      creationDate: new Date().toISOString(), // Assuming creationDate is now
      modificationDate: new Date().toISOString(), // Assuming modificationDate is now
    };
    return this.qrMenusRepository.createQrMenu(qrMenu);
  }

  async getQrMenuById(qrMenuId: string): Promise<QrMenuModel | null> {
    return this.qrMenusRepository.getQrMenuById(qrMenuId);
  }

  async listQrMenus(): Promise<QrMenuModel[]> {
    return this.qrMenusRepository.listQrMenus();
  }

  async updateQrMenu(qrMenu: QrMenuModel): Promise<void> {
    return this.qrMenusRepository.updateQrMenu(qrMenu);
  }
}
