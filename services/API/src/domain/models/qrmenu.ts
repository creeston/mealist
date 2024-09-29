import { MenuPage } from './menu';
import { Restaurant } from './restaurant';

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
  loadingPlaceholderMenuIndex: number | null;
  stats: QrStats;
  creationDate: string;
  modificationDate: string;
}

export interface CreateQrMenuRequest {
  name: string;
  urlSuffix: string;
  title: string;
  restaurantId: string;
  sectionsToShow: string[];
  style: QrMenuStyle;
  menus: CreateQrMenuItem[];
  loadingPlaceholderKey: string;
}

export interface CreateQrMenuItem {
  menuId: string;
  title: string;
}

export interface QrMenuItem {
  title: string;
  pages?: MenuPage[];
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
