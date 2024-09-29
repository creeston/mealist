import { model, Schema, Model, Document } from 'mongoose';
import { Menu, MenuPage } from '../../domain/models/menu';

const OcrBoxSchema = new Schema({
  x1: Number,
  y1: Number,
  x2: Number,
  y2: Number,
});

const MenuLineSchema = new Schema({
  blockId: String,
  text: String,
  box: OcrBoxSchema,
});

const MenuPageSchema = new Schema({
  pageNumber: Number,
  imagePath: String,
  markup: [MenuLineSchema],
});

const MenuSchema = new Schema({
  name: String,
  menuPath: String,
  creationDate: String,
  modifiedDate: String,
  language: String,
  status: String,
  pages: [MenuPageSchema],
});

export const MenuModel = model('Menu', MenuSchema);

export function mapToMenuModel(menu: Menu) {
  return {
    name: menu.name,
    menuPath: menu.menuPath,
    creationDate: menu.creationDate,
    modifiedDate: menu.modifiedDate,
    language: menu.language,
    status: menu.status,
    pages: menu.pages?.map((page) => ({
      pageNumber: page.pageNumber,
      imagePath: page.imagePath,
      markup: page.markup?.map((line) => ({
        blockId: line.blockId,
        text: line.text,
        box: line.box,
      })),
    })),
  };
}

export function mapToMenu(document: any): Menu {
  return {
    id: document._id.toString(),
    name: document.name,
    menuPath: document.menuPath,
    creationDate: document.creationDate,
    modifiedDate: document.modifiedDate,
    language: document.language,
    status: document.status,
    pages: document.pages.map(mapMenuPageModelToMenuPage),
  };
}

export function mapMenuPageModelToMenuPage(pageModel: any): MenuPage {
  return {
    pageNumber: pageModel.pageNumber,
    imagePath: pageModel.imagePath,
    markup: pageModel.markup.map((line: any) => ({
      blockId: line.blockId,
      text: line.text,
      box: line.box,
    })),
  };
}
