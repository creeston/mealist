import { Menu } from './menu';
import { Restaurant } from './restaurant';

export interface QrMenu {
  id: string;
  name: string;
  restaurant: Restaurant;
  style: QrMenuStyle;
  items: QrMenuItem[];
  urlSuffix: string;
  stats: QrStats;
  creationDate: string;
  modificationDate: string;
}

export interface CreateQrMenuRequest {
  name: string;
  style: QrMenuStyle;
  urlSuffix: string;
  items: CreateQrMenuItem[];
  restaurantId: string;
  creationDate: string;
}

export interface CreateQrMenuItem {
  menuId: string;
  style: QrMenuItemStyle;
}

export interface QrMenuItem {
  menu: Menu;
  style: QrMenuItemStyle;
}

export interface QrMenuItemStyle {
  thumbnailIndex: number;
  title: string;
}

export interface QrMenuStyle {
  displayName: string;
  primaryColor: string;
  secondaryColor: string;
  fontColor: string;
  previewIndex: number;
}

export interface QrStats {
  scanCount: number;
}
