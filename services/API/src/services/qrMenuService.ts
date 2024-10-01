import { CreateQrMenuCommand, QrMenu } from '../domain/models/qrmenu';
import { QrMenusRepository } from '../data-access/repositories/qrMenusRepository';
import { StorageService } from '../data-access/storage/storageService';
import { MenusRepository } from '../data-access/repositories/menusRepository';

export class QrMenuService {
  constructor(
    private qrMenusRepository: QrMenusRepository,
    private storageService: StorageService,
    private menusRepository: MenusRepository
  ) {}

  async createQrMenu(createCommand: CreateQrMenuCommand): Promise<string> {
    const loadingPlaceholderKey = await this.uploadLoadingPlaceholder(createCommand);
    createCommand.stats = {
      scanCount: 0,
    };
    const qrMenuId = await this.qrMenusRepository.createQrMenu(createCommand, loadingPlaceholderKey);
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

  async updateQrMenu(qrMenu: QrMenu): Promise<void> {
    await Promise.resolve(0);
    // await this.qrMenusRepository.updateQrMenu(qrMenu);
  }

  private async uploadLoadingPlaceholder(createCommand: CreateQrMenuCommand): Promise<string> {
    const placeholderKey = this.storageService.getLoadingPlaceholderKey(createCommand.urlSuffix);
    const menuIndex = createCommand.loadingPlaceholderMenuIndex;

    if (createCommand.customLoadingPlaceholder && menuIndex === undefined) {
      this.storageService.uploadFile(placeholderKey, createCommand.customLoadingPlaceholder);
    } else if (menuIndex !== undefined) {
      await this.copyExistingMenuPageToPlaceholderLocation(createCommand, menuIndex!, placeholderKey);
    } else {
      throw new Error('Invalid loading placeholder configuraiton.');
    }

    return placeholderKey;
  }

  private async copyExistingMenuPageToPlaceholderLocation(
    creationRequest: CreateQrMenuCommand,
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
