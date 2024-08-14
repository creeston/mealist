export interface MarkedMenu {
    menuId: string;
    name: string;
    pages: MarkedPage[];
    stopStyle: string;
    stopColor: string;
}

export interface MarkedPage {
    pageNumber: number;
    imageUrl: string;
    markup: MarkedLine[];
    imageElement: HTMLImageElement;
}

export interface Viewport {
    x1: number;
    y1: number;
    height: number;
    width: number;
}

export interface MarkedLine {
    text: string;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    editSelected: boolean;
    viewSelected: boolean;
    hover: boolean;
    children: MarkedLine[];
}