import { CreateQrMenuCommand, QrMenu } from '../../domain/models/qrmenu';
import { QrMenuModel, mapCreationRequestToQrMenuModel, mapModelToQrMenu } from '../models/qrMenuModel';

export class QrMenusRepository {
  async createQrMenu(creationRequest: CreateQrMenuCommand, uploadedPlaceholderKey: string): Promise<string> {
    const creationDate = new Date().toISOString();
    const qrMenuModel = mapCreationRequestToQrMenuModel(creationRequest, creationDate, uploadedPlaceholderKey);
    const qrMenuDocument = new QrMenuModel(qrMenuModel);
    const result = await qrMenuDocument.save();
    const id = result._id.toString();
    return id;
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

  // async updateQrMenu(qrMenu: QrMenu): Promise<void> {
  //   await QrMenuModel.findByIdAndUpdate(qrMenu.id, mapToQrMenuModel(qrMenu));
  // }
}
