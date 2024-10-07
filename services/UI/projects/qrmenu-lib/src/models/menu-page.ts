import { MenuLine } from './menu-line';

export interface MenuPage {
  pageNumber: number;
  imageUrl: string;
  markup?: Array<MenuLine>;
}
