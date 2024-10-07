import { MenuPage } from './menu-page';

export interface MenuSpecification {
  stopColor?: string;
  stopStyle?: string;
  title?: string;
  pages?: Array<MenuPage>;
}
