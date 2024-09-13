import { CreateQrMenuRequest, QrMenu } from '../../domain/models/qrmenu';
import { QrMenuModel, mapCreationRequestToQrMenuModel, mapToQrMenu, mapToQrMenuModel } from '../models/qrMenuModel';

export class QrMenusRepository {
  async createQrMenu(creationRequest: CreateQrMenuRequest): Promise<QrMenu> {
    const qrMenuDocument = new QrMenuModel(mapCreationRequestToQrMenuModel(creationRequest));
    const result = await qrMenuDocument.save();
    const qrMenu = await mapToQrMenu(result);
    qrMenu.id = result._id.toString();
    return qrMenu;
  }

  async getQrMenuById(qrMenuId: string): Promise<QrMenu | null> {
    const document = await QrMenuModel.findById(qrMenuId);
    if (!document) {
      throw new Error('Menu not found');
    }

    return await mapToQrMenu(document);
  }

  async listQrMenus(): Promise<QrMenu[]> {
    const documents = await QrMenuModel.find();
    return await Promise.all(documents.map(mapToQrMenu));
  }

  async updateQrMenu(qrMenu: QrMenu): Promise<void> {
    await QrMenuModel.findByIdAndUpdate(qrMenu.id, mapToQrMenuModel(qrMenu));
  }
}
