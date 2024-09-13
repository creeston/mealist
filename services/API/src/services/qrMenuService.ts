import { CreateQrMenuRequest, QrMenu, QrMenuStyle } from '../domain/models/qrmenu';
import { components } from '../presentation/api';
import { QrMenusRepository } from '../data-access/repositories/qrMenusRepository';

type QrMenuResponseModel = components['schemas']['QrMenu'];
type CreateQrMenuApiRequest = components['schemas']['CreateQrMenuRequest'];

export class QrMenuService {
  constructor(private qrMenusRepository: QrMenusRepository) {}

  async createQrMenu(creationRequest: CreateQrMenuApiRequest): Promise<QrMenuResponseModel> {
    const qrMenu = await this.qrMenusRepository.createQrMenu({
      name: creationRequest.name,
      restaurantId: creationRequest.restaurantId,
      style: {
        displayName: creationRequest.displayName,
        primaryColor: creationRequest.primaryColor,
        secondaryColor: creationRequest.secondaryColor,
        fontColor: creationRequest.fontColor,
        previewIndex: creationRequest.previewIndex,
      } as QrMenuStyle,
      urlSuffix: creationRequest.urlSuffix,
      items:
        creationRequest.items?.map((item) => ({
          menuId: item.menuId,
          style: {
            thumbnailIndex: item.thumbnailIndex,
            title: item.title,
          },
        })) ?? [],
      creationDate: new Date().toISOString(), // Assuming creationDate is now
    } as CreateQrMenuRequest);

    return this.mapDomainToApiModel(qrMenu);
  }

  async getQrMenuById(qrMenuId: string): Promise<QrMenuResponseModel | null> {
    const qrMenu = await this.qrMenusRepository.getQrMenuById(qrMenuId);
    if (!qrMenu) {
      return null;
    }

    return this.mapDomainToApiModel(qrMenu);
  }

  async listQrMenus(): Promise<QrMenuResponseModel[]> {
    const menus = await this.qrMenusRepository.listQrMenus();
    return menus.map(this.mapDomainToApiModel);
  }

  async updateQrMenu(qrMenu: QrMenu): Promise<void> {
    await this.qrMenusRepository.updateQrMenu(qrMenu);
  }

  private mapDomainToApiModel(qrMenu: QrMenu): QrMenuResponseModel {
    return {
      id: qrMenu.id,
      name: qrMenu.name,
      restaurant: qrMenu.restaurant,
      primaryColor: qrMenu.style.primaryColor,
      secondaryColor: qrMenu.style.secondaryColor,
      fontColor: qrMenu.style.fontColor,
      scanCount: qrMenu.stats.scanCount,
      previewIndex: qrMenu.style.previewIndex,
      urlSuffix: qrMenu.urlSuffix,
      items: qrMenu.items.map((item) => ({
        menuId: item.menu.id,
        title: item.style.title,
        thumbnailIndex: item.style.thumbnailIndex,
      })),
      creationDate: qrMenu.creationDate,
      modificationDate: qrMenu.modificationDate,
    };
  }
}
