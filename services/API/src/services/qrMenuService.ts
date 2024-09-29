import { CreateQrMenuRequest, QrMenu, QrMenuStyle } from '../domain/models/qrmenu';
import { components } from '../presentation/api';
import { QrMenusRepository } from '../data-access/repositories/qrMenusRepository';
import { StorageService } from '../data-access/storage/storageService';
import { MenusRepository } from '../data-access/repositories/menusRepository';
import { MenusService } from './menusService';

type QrMenuResponseModel = components['schemas']['QrMenu'];
type CreateQrMenuApiRequest = components['schemas']['CreateQrMenuRequest'];

export class QrMenuService {
  constructor(
    private menusService: MenusService,
    private qrMenusRepository: QrMenusRepository,
    private storageService: StorageService,
    private menusRepository: MenusRepository
  ) {}

  async createQrMenu(
    creationRequest: CreateQrMenuApiRequest,
    customLoadingPlaceholderFile: Express.Multer.File
  ): Promise<string> {
    const loadingPlaceholderPath = await this.uploadLoadingPlaceholder(creationRequest, customLoadingPlaceholderFile);
    const createMenuRequest = {
      name: creationRequest.name,
      urlSuffix: creationRequest.urlSuffix,
      title: creationRequest.title,
      restaurantId: creationRequest.restaurantId,
      sectionsToShow: creationRequest.sectionsToShow,
      style: creationRequest.style as QrMenuStyle,
      menus: creationRequest.menus,
      loadingPlaceholderKey: loadingPlaceholderPath,
    } as CreateQrMenuRequest;

    const qrMenuId = await this.qrMenusRepository.createQrMenu(createMenuRequest);
    return qrMenuId;
  }

  async getQrMenuById(qrMenuId: string): Promise<QrMenuResponseModel | null> {
    const qrMenu = await this.qrMenusRepository.getQrMenuById(qrMenuId);
    if (!qrMenu) {
      return null;
    }

    return this.mapDomainToApiModel(qrMenu);
  }

  async getQrMenuByUrlSuffix(urlSuffix: string): Promise<QrMenuResponseModel | null> {
    const qrMenu = await this.qrMenusRepository.getQrMenuByUrlSuffix(urlSuffix);
    if (!qrMenu) {
      return null;
    }

    return this.mapDomainToApiModel(qrMenu);
  }

  async listQrMenus(): Promise<QrMenuResponseModel[]> {
    const menus = await this.qrMenusRepository.listQrMenus();
    return await Promise.all(menus.map(this.mapDomainToApiModel));
  }

  async updateQrMenu(qrMenu: QrMenu): Promise<void> {
    await Promise.resolve(0);
    // await this.qrMenusRepository.updateQrMenu(qrMenu);
  }

  private async mapDomainToApiModel(qrMenu: QrMenu): Promise<QrMenuResponseModel> {
    const loadingPlaceholderUrl = await this.storageService.getFileFromPublicBucket(qrMenu.loadingPlaceholderKey);
    const menus = [];
    for (const item of qrMenu.menus) {
      if (!item.pages) {
        throw new Error('Menu item does not have any pages');
      }

      const pages = await this.menusService.mapMenusPagesToApiModel(item.pages);
      menus.push({
        stopColor: item.stopColor,
        stopStyle: item.stopStyle,
        pages: pages,
        title: item.title,
      });
    }

    return {
      id: qrMenu.id,
      name: qrMenu.name,
      restaurant: qrMenu.restaurant,
      sectionsToShow: qrMenu.sectionsToShow,
      style: qrMenu.style,
      scanCount: qrMenu.stats.scanCount,
      loadingPlaceholderUrl: loadingPlaceholderUrl,
      urlSuffix: qrMenu.urlSuffix,
      menus: menus,
      creationDate: qrMenu.creationDate,
      modificationDate: qrMenu.modificationDate,
    };
  }

  private async uploadLoadingPlaceholder(
    creationRequest: CreateQrMenuApiRequest,
    customLoadingPlaceholderFile: Express.Multer.File
  ): Promise<string> {
    const placeholderKey = this.storageService.getLoadingPlaceholderKey(creationRequest.urlSuffix);
    const menuIndex = creationRequest.loadingPlaceholder.menuIndex;

    if (customLoadingPlaceholderFile && menuIndex === undefined) {
      this.storageService.uploadFile(placeholderKey, customLoadingPlaceholderFile.buffer);
    } else if (menuIndex !== undefined) {
      await this.copyExistingMenuPageToPlaceholderLocation(creationRequest, menuIndex!, placeholderKey);
    } else {
      throw new Error('Invalid loading placeholder configuraiton.');
    }

    return placeholderKey;
  }

  private async copyExistingMenuPageToPlaceholderLocation(
    creationRequest: CreateQrMenuApiRequest,
    menuIndex: number,
    loadingPlaceholderPath: string
  ): Promise<void> {
    const menuId = creationRequest.menus[menuIndex].menuId;
    const menu = await this.menusRepository.getMenuById(menuId);
    if (!menu || !menu.pages) {
      throw new Error('Menu not found');
    }

    const menuImageKey = menu.pages[0].imagePath;
    this.storageService.copyFileToPublicBucket(menuImageKey, loadingPlaceholderPath);
  }
}
