import { MenuModel } from "../models/menu";

export interface IMenusRepository {
    createMenu(menu: MenuModel): Promise<MenuModel>;
    getMenuById(menuId: string): Promise<MenuModel>;
    listMenus(): Promise<MenuModel[]>
    updateMenu(menu: MenuModel): Promise<void>;
}