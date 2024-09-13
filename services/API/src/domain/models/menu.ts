import { MenuLanguage } from '../enums/menuLanguage';
import { MenuProcessingStatus } from '../enums/menuProcessingStatus';

export interface Menu {
  id?: string;
  name: string;
  menuPath?: string;
  creationDate: string;
  modifiedDate?: string;
  language: MenuLanguage;
  status: MenuProcessingStatus;
  pages?: MenuPage[];
}

export interface MenuPage {
  pageNumber: number;
  imagePath: string;
  markup?: MenuLine[];
}

export interface MenuLine {
  blockId: string;
  text: string;
  box: OcrBox;
}

export interface OcrBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
