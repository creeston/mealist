import { ObjectId } from "mongodb";
import { IMenusRepository } from "../interfaces/menusRepository";
import { MenuModel } from "../models/menu";
import { collections } from "./connection";

export class MenusRepository implements IMenusRepository {
  async createMenu(menu: MenuModel): Promise<MenuModel> {
    const result = await collections.menus!.insertOne(menu);
    menu.id = result.insertedId.toString();
    return menu;
  }

  async getMenuById(menuId: string): Promise<MenuModel> {
    const query = { _id: new ObjectId(menuId) };
    const document = await collections.menus!.findOne(query);
    if (!document) {
      throw new Error("Menu not found");
    }
    const { _id, ...rest } = document;
    const menu = rest as MenuModel;
    menu.id = _id.toString();
    return menu;
  }

  async listMenus(): Promise<MenuModel[]> {
    const documents = await collections.menus!.find().toArray();
    return documents.map((document) => {
      const { _id, ...rest } = document;
      const menu = rest as MenuModel;
      menu.id = _id.toString();
      return menu;
    });
  }

  async updateMenu(menu: MenuModel): Promise<void> {
    const query = { _id: new ObjectId(menu.id) };
    await collections.menus!.updateOne(query, { $set: menu });
  }
}