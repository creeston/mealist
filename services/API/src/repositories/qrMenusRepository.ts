import { ObjectId } from 'mongodb';
import { IQrMenusRepository } from '../interfaces/qrMenusRepository';
import { collections } from './connection';
import { QrMenuModel } from '../models/qrmenu';

export class QrMenusRepository implements IQrMenusRepository {
  async createQrMenu(qrMenu: QrMenuModel): Promise<QrMenuModel> {
    const result = await collections.qrmenus!.insertOne(qrMenu);
    qrMenu.id = result.insertedId.toString();
    return qrMenu;
  }

  async getQrMenuById(qrMenuId: string): Promise<QrMenuModel | null> {
    const query = { _id: new ObjectId(qrMenuId) };
    const document = await collections.qrmenus!.findOne(query);
    if (!document) {
      return null;
    }
    const { _id, ...rest } = document;
    const qrMenu = rest as QrMenuModel;
    qrMenu.id = _id.toString();
    return qrMenu;
  }

  async listQrMenus(): Promise<QrMenuModel[]> {
    const documents = await collections.qrmenus!.find().toArray();
    return documents.map((document) => {
      const { _id, ...rest } = document;
      const qrMenu = rest as QrMenuModel;
      qrMenu.id = _id.toString();
      return qrMenu;
    });
  }

  async updateQrMenu(qrMenu: QrMenuModel): Promise<void> {
    const query = { _id: new ObjectId(qrMenu.id) };
    await collections.qrmenus!.updateOne(query, { $set: qrMenu });
  }
}
