import {
  CreateQrMenuCommand,
  CreateQrMenuItemCommand,
  QrMenu,
  QrMenuItem,
  UpdateQrMenuCommand,
} from '../domain/models/qrmenu';
import { QrMenusRepository } from '../data-access/repositories/qrMenusRepository';
import { StorageService } from '../data-access/storage/storageService';
import { MenusService } from './menusService';
import { RestaurantsService } from './restaurantsService';

export class QrMenuService {
  constructor(
    private qrMenusRepository: QrMenusRepository,
    private storageService: StorageService,
    private menusService: MenusService,
    private restaurantService: RestaurantsService
  ) {}

  async createQrMenu(createCommand: CreateQrMenuCommand): Promise<string> {
    const loadingPlaceholderKey = await this.uploadLoadingPlaceholder(
      createCommand.urlSuffix,
      createCommand.loadingPlaceholderMenuIndex,
      createCommand.customLoadingPlaceholder,
      createCommand.menus
    );

    const restaurant = await this.restaurantService.getRestaurantById(createCommand.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const menus = await this.getMenusItems(createCommand.menus);
    const qrMenu: QrMenu = {
      id: '',
      name: createCommand.name,
      urlSuffix: createCommand.urlSuffix,
      restaurant: restaurant,
      title: createCommand.title,
      sectionsToShow: createCommand.sectionsToShow,
      style: createCommand.style,
      menus: menus,
      loadingPlaceholderKey: loadingPlaceholderKey,
      loadingPlaceholderMenuIndex: createCommand.loadingPlaceholderMenuIndex,
      stats: {
        scanCount: 0,
      },
      creationDate: new Date().toISOString(),
    };

    const qrMenuId = await this.qrMenusRepository.createQrMenu(qrMenu);
    return qrMenuId;
  }

  async getQrMenuById(qrMenuId: string): Promise<QrMenu | null> {
    const qrMenu = await this.qrMenusRepository.getQrMenuById(qrMenuId);
    if (!qrMenu) {
      return null;
    }

    return qrMenu;
  }

  async getQrMenuByUrlSuffix(urlSuffix: string): Promise<QrMenu | null> {
    const qrMenu = await this.qrMenusRepository.getQrMenuByUrlSuffix(urlSuffix);
    if (!qrMenu) {
      return null;
    }

    return qrMenu;
  }

  async listQrMenus(): Promise<QrMenu[]> {
    const menus = await this.qrMenusRepository.listQrMenus();
    return menus;
  }

  async updateQrMenu(qrMenuId: string, updateCommand: UpdateQrMenuCommand): Promise<void> {
    const qrMenu = await this.qrMenusRepository.getQrMenuById(qrMenuId);
    if (!qrMenu) {
      throw new Error('Menu not found');
    }

    const restaurant = await this.restaurantService.getRestaurantById(updateCommand.restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const menuIndex = updateCommand.loadingPlaceholderMenuIndex;
    const loadingPlaceholderKey = this.storageService.getLoadingPlaceholderKey(updateCommand.urlSuffix);

    if (updateCommand.customLoadingPlaceholder && (menuIndex === undefined || menuIndex < 0)) {
      this.storageService.uploadFileToPublicBucket(loadingPlaceholderKey, updateCommand.customLoadingPlaceholder);
    }

    // Custom placeholder wan't updated
    if (updateCommand.customLoadingPlaceholder == null && (menuIndex === undefined || menuIndex < 0)) {
      // If url suffix was updated, we need to copy the existing loading placeholder to the new location
      if (qrMenu.urlSuffix !== updateCommand.urlSuffix) {
        this.storageService.copyFileWithinPublicBuclet(qrMenu.loadingPlaceholderKey, loadingPlaceholderKey);
      }
    }

    if (menuIndex !== undefined && menuIndex >= 0) {
      await this.copyExistingMenuPageToPlaceholderLocation(updateCommand.menus, menuIndex, loadingPlaceholderKey);
    }

    const menus = await this.getMenusItems(updateCommand.menus);

    qrMenu.name = updateCommand.name;
    qrMenu.urlSuffix = updateCommand.urlSuffix;
    qrMenu.restaurant = restaurant;
    qrMenu.title = updateCommand.title;
    qrMenu.sectionsToShow = updateCommand.sectionsToShow;
    qrMenu.style = updateCommand.style;
    qrMenu.menus = menus;
    qrMenu.loadingPlaceholderMenuIndex = updateCommand.loadingPlaceholderMenuIndex;
    qrMenu.loadingPlaceholderKey = loadingPlaceholderKey;
    qrMenu.modificationDate = new Date().toISOString();

    await this.qrMenusRepository.updateQrMenu(qrMenu);
  }

  private async getMenusItems(createMenuItems: CreateQrMenuItemCommand[]): Promise<QrMenuItem[]> {
    const menus = [];

    for (const item of createMenuItems) {
      const menu = await this.menusService.getMenuById(item.menuId);
      if (!menu) {
        throw new Error(`Menu ${item.menuId} not found`);
      }

      menus.push({
        title: item.title,
        menu,
        stopColor: '#fff',
        stopStyle: 'underline',
      });
    }

    return menus;
  }

  async deleteQrMenu(qrMenuId: string): Promise<void> {
    await this.qrMenusRepository.deleteQrMenu(qrMenuId);
  }

  private async uploadLoadingPlaceholder(
    urlSuffix: string,
    loadingPlaceholderMenuIndex: number | undefined,
    customLoadingPlaceholder: any | null,
    createQrMenuItemCommands: CreateQrMenuItemCommand[]
  ): Promise<string> {
    const placeholderKey = this.storageService.getLoadingPlaceholderKey(urlSuffix);
    const menuIndex = loadingPlaceholderMenuIndex;

    if (customLoadingPlaceholder && (menuIndex === undefined || menuIndex < 0)) {
      this.storageService.uploadFileToPublicBucket(placeholderKey, customLoadingPlaceholder);
    } else if (menuIndex !== undefined && menuIndex >= 0) {
      await this.copyExistingMenuPageToPlaceholderLocation(createQrMenuItemCommands, menuIndex!, placeholderKey);
    } else {
      throw new Error('Invalid loading placeholder configuraiton.');
    }

    return placeholderKey;
  }

  private async copyExistingMenuPageToPlaceholderLocation(
    createQrMenuItemCommands: CreateQrMenuItemCommand[],
    menuIndex: number,
    loadingPlaceholderPath: string
  ): Promise<void> {
    const menuId = createQrMenuItemCommands[menuIndex].menuId;
    const menu = await this.menusService.getMenuById(menuId);
    if (!menu || !menu.pages) {
      throw new Error('Menu not found');
    }

    const menuImageKey = menu.pages[0].imagePath;
    this.storageService.copyFileToPublicBucket(menuImageKey, loadingPlaceholderPath);
  }
}
