export interface IQrMenusRepository {
    createQrMenu(qrMenu: QrMenuModel): Promise<QrMenuModel>;
    getQrMenuById(qrMenuId: string): Promise<QrMenuModel>;
    listQrMenus(): Promise<QrMenuModel[]>;
    updateQrMenu(qrMenu: QrMenuModel): Promise<void>;
}