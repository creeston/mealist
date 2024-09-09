export interface QrMenuItem {
  menuId: string;
  title: string;
  thumbnailIndex: number;
}

export interface QrMenuModel {
  id?: string;
  name: string;
  displayName: string;
  restaurantId: string;
  primaryColor: string;
  secondaryColor: string;
  fontColor: string;
  scanCount: number;
  stopList: string[];
  hideSections: string[];
  previewIndex: number;
  urlSuffix: string;
  items: QrMenuItem[];
  creationDate: string;
  modificationDate: string;
}
