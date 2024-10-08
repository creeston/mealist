import { MenuSpecification } from './menu-specification';
import { QrMenuStyle } from './qrmenu-style';
import { RestaurantInfo } from './restaurant-info';

export interface QrMenuSpecification {
  title: string;
  restaurant: RestaurantInfo;
  sectionsToShow: Array<string>;
  style: QrMenuStyle;
  loadingPlaceholderUrl: string;
  menus: MenuSpecification[];
}
