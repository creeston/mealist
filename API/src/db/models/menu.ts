export interface MenuModel {
  id?: string;
  name: string;
  menuPath?: string;
  creationDate: string;
  modifiedDate?: string;
  language: MenuLanguage;
  status: MenuProcessingStatus;
  pages?: MenuPageModel[];
}

export interface MenuPageModel {
  pageNumber: number;
  imagePath: string;
  markup?: MenuLineModel[];
}

export interface MenuLineModel {
  blockId: string;
  text: string;
  box: OcrBoxModel;
}

export interface OcrBoxModel {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export type MenuProcessingStatus =
  | "NOT_PARSED"
  | "PARSING_IN_PROGRESS"
  | "PARSING_FAILED"
  | "PARSING_COMPLETED"
  | "OCR_IN_PROGRESS"
  | "OCR_FAILED"
  | "OCR_COMPLETED"
  | "REVIEWED";

export type MenuLanguage = "eng" | "deu" | "rus" | "ukr" | "pol" | "bel";
