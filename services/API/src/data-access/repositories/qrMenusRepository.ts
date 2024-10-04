import { QrMenu } from '../../domain/models/qrmenu';
import { QrMenuModel, mapQrMenuDomainToDbModel, mapModelToQrMenu } from '../models/qrMenuModel';

export class QrMenusRepository {
  async createQrMenu(qrMenu: QrMenu): Promise<string> {
    const qrMenuModel = mapQrMenuDomainToDbModel(qrMenu);
    const qrMenuDocument = new QrMenuModel(qrMenuModel);
    const result = await qrMenuDocument.save();
    const id = result._id.toString();
    qrMenu.id = id;
    return id;
  }

  async updateQrMenu(qrMenu: QrMenu): Promise<void> {
    await QrMenuModel.findByIdAndUpdate(qrMenu.id, mapQrMenuDomainToDbModel(qrMenu));
  }

  async getQrMenuById(qrMenuId: string): Promise<QrMenu | null> {
    const document = await QrMenuModel.findById(qrMenuId);
    if (!document) {
      throw new Error('Menu not found');
    }

    return await mapModelToQrMenu(document);
  }

  async getQrMenuByUrlSuffix(urlSuffix: string): Promise<QrMenu | null> {
    const document = await QrMenuModel.findOne({ urlSuffix });
    if (!document) {
      return null;
    }

    return await mapModelToQrMenu(document);
  }

  async listQrMenus(): Promise<QrMenu[]> {
    const documents = await QrMenuModel.find();
    return await Promise.all(documents.map(mapModelToQrMenu));
  }

  async deleteQrMenu(qrMenuId: string): Promise<void> {
    await QrMenuModel.findByIdAndDelete(qrMenuId);
  }

  // async updateQrMenu(qrMenu: QrMenu): Promise<void> {
  //   await QrMenuModel.findByIdAndUpdate(qrMenu.id, mapToQrMenuModel(qrMenu));
  // }
}
