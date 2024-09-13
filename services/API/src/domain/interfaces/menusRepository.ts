import { Menu } from '../models/menu';

export interface IMenusRepository {
  createMenu(menu: Menu): Promise<Menu>;
  getMenuById(menuId: string): Promise<Menu>;
  listMenus(): Promise<Menu[]>;
  updateMenu(menu: Menu): Promise<void>;
}
