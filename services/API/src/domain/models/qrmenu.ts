import { Menu } from './menu';
import { Restaurant } from './restaurant';
import { StreamingBlobPayloadInputTypes } from '@smithy/types';

export interface QrMenu {
  id: string;
  name: string;
  urlSuffix: string;
  restaurant: Restaurant;
  title: string;
  sectionsToShow: string[];
  style: QrMenuStyle;
  menus: QrMenuItem[];
  loadingPlaceholderKey: string;
  loadingPlaceholderMenuIndex?: number;
  stats: QrStats;
  creationDate: string;
  modificationDate?: string;
}

export interface CreateQrMenuCommand {
  name: string;
  urlSuffix: string;
  title: string;
  restaurantId: string;
  sectionsToShow: string[];
  style: QrMenuStyle;
  menus: CreateQrMenuItemCommand[];
  loadingPlaceholderMenuIndex?: number;
  customLoadingPlaceholder: StreamingBlobPayloadInputTypes | null;
}

export interface UpdateQrMenuCommand {
  name: string;
  urlSuffix: string;
  title: string;
  restaurantId: string;
  sectionsToShow: string[];
  style: QrMenuStyle;
  menus: CreateQrMenuItemCommand[];
  loadingPlaceholderMenuIndex?: number;
  customLoadingPlaceholder: StreamingBlobPayloadInputTypes | null;
}

export interface CreateQrMenuItemCommand {
  menuId: string;
  title: string;
}

export interface QrMenuItem {
  title: string;
  menu: Menu;
  stopColor: string;
  stopStyle: string;
}

export interface QrMenuStyle {
  headerColor: string;
  actionsColor: string;
  fontColor: string;
  backgroundColor: string;
}

export interface QrStats {
  scanCount: number;
}
