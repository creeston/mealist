import { IMenusRepository } from '../../domain/interfaces/menusRepository';
import { Menu } from '../../domain/models/menu';
import { MenuModel, mapToMenu, mapToMenuModel } from '../models/menuModel';

export class MenusRepository implements IMenusRepository {
  async createMenu(menu: Menu): Promise<Menu> {
    const menuDocument = new MenuModel(mapToMenuModel(menu));
    const result = await menuDocument.save();
    menu.id = result._id.toString();
    return menu;
  }

  async getMenuById(menuId: string): Promise<Menu> {
    const document = await MenuModel.findById(menuId);
    if (!document) {
      throw new Error('Menu not found');
    }
    return mapToMenu(document);
  }

  async listMenus(): Promise<Menu[]> {
    const documents = await MenuModel.find().exec();
    return documents.map(mapToMenu);
  }

  async updateMenu(menu: Menu): Promise<void> {
    const menuDocument = mapToMenuModel(menu);
    await MenuModel.findByIdAndUpdate(menu.id, menuDocument);
  }
}
