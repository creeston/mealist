/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/menus": {
    /** Get all menus */
    get: operations["getAllMenus"];
    /** Create a menu */
    post: operations["createMenu"];
  };
  "/menus/{menuId}": {
    /** Get a menu by ID */
    get: operations["getMenuById"];
  };
  "/menus/{menuId}/pages": {
    /** Update menu pages */
    put: operations["updateMenuPages"];
  };
  "/restaurants": {
    /** Get all restaurants */
    get: operations["getAllRestaurants"];
    /** Create a restaurant */
    post: operations["createRestaurant"];
  };
  "/restaurants/{restaurantId}": {
    /** Get a restaurant by ID */
    get: operations["getRestaurantById"];
    /** Update a restaurant */
    put: operations["updateRestaurant"];
    /** Delete a restaurant */
    delete: operations["deleteRestaurant"];
  };
  "/qrmenus": {
    /** Get all qr menus */
    get: operations["getAllQrMenus"];
    /** Create a qr menu */
    post: operations["createQrMenu"];
  };
  "/qrmenus/{qrMenuId}": {
    /** Get a qr menu by ID */
    get: operations["getQrMenuById"];
    /** Update a qr menu */
    put: operations["updateQrMenu"];
    /** Delete a qr menu */
    delete: operations["deleteQrMenu"];
  };
  "/qr/{urlSuffix}": {
    /** Get a qr menu by URL suffix */
    get: operations["getQrMenuBySuffix"];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    Restaurant: {
      id?: string;
      name: string;
      address: string;
      city: string;
      description?: string;
      wifiName?: string;
      wifiPassword?: string;
      instagramUrl?: string;
      facebookUrl?: string;
      tripAdvisorUrl?: string;
    };
    ReadonlyRestaurant: {
      name?: string;
      address?: string;
      city?: string;
      description?: string;
      wifiName?: string;
      wifiPassword?: string;
      instagramUrl?: string;
      facebookUrl?: string;
      tripAdvisorUrl?: string;
    };
    CreateMenuRequest: {
      name?: string;
      /** @enum {string} */
      language?: "eng" | "rus" | "ukr" | "bel" | "pol" | "deu";
      /** Format: binary */
      file: string;
    };
    Menu: {
      id?: string;
      name: string;
      /** @enum {string} */
      status?: "NOT_PARSED" | "PARSING_IN_PROGRESS" | "PARSING_FAILED" | "PARSING_COMPLETED" | "OCR_IN_PROGRESS" | "OCR_FAILED" | "OCR_COMPLETED" | "REVIEWED";
      dishesCount?: number;
      originalFileUrl?: string;
      stopColor?: string;
      stopStyle?: string;
      /** Format: date-time */
      creationDate?: string;
      /** Format: date-time */
      modificationDate?: string;
      pages?: components["schemas"]["MenuPage"][];
    };
    MenuPage: {
      pageNumber: number;
      imageUrl: string;
      markup?: components["schemas"]["MenuLine"][];
    };
    MenuLine: {
      text?: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
    Code: {
      menuId: number;
    };
    ReadonlyQrMenu: {
      title?: string;
      restaurant: components["schemas"]["ReadonlyRestaurant"];
      sectionsToShow: string[];
      style: components["schemas"]["QrMenuStyle"];
      loadingPlaceholderUrl: string;
      menus: components["schemas"]["ReadonlyQrMenuItem"][];
    };
    QrMenu: {
      id: string;
      name: string;
      urlSuffix: string;
      title?: string;
      restaurant: components["schemas"]["Restaurant"];
      sectionsToShow: string[];
      style: components["schemas"]["QrMenuStyle"];
      scanCount?: number;
      loadingPlaceholderMenuIndex?: number;
      loadingPlaceholderUrl: string;
      menus: components["schemas"]["QrMenuItem"][];
      /** Format: date-time */
      creationDate: string;
      /** Format: date-time */
      modificationDate?: string;
    };
    QrMenuItem: {
      stopColor?: string;
      stopStyle?: string;
      title?: string;
      menu?: components["schemas"]["Menu"];
    };
    ReadonlyQrMenuItem: {
      stopColor?: string;
      stopStyle?: string;
      title?: string;
      pages?: components["schemas"]["MenuPage"][];
    };
    QrMenuStyle: {
      headerColor?: string;
      actionsColor?: string;
      fontColor?: string;
      backgroundColor?: string;
    };
    CreateQrMenuRequest: {
      name: string;
      urlSuffix: string;
      title?: string;
      restaurantId: string;
      sectionsToShow: string[];
      style: components["schemas"]["QrMenuStyle"];
      loadingPlaceholder: components["schemas"]["CreateLoadingPlaceholderRequest"];
      menus: components["schemas"]["CreateQrMenuItem"][];
    };
    UpdateQrMenuRequest: {
      name: string;
      urlSuffix: string;
      title?: string;
      restaurantId: string;
      sectionsToShow: string[];
      style: components["schemas"]["QrMenuStyle"];
      loadingPlaceholder: components["schemas"]["CreateLoadingPlaceholderRequest"];
      menus: components["schemas"]["CreateQrMenuItem"][];
    };
    CreateLoadingPlaceholderRequest: {
      menuIndex?: number;
    };
    CreateQrMenuItem: {
      title: string;
      menuId: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {

  /** Get all menus */
  getAllMenus: {
    responses: {
      /** @description A list of menus */
      200: {
        content: {
          "application/json": components["schemas"]["Menu"][];
        };
      };
    };
  };
  /** Create a menu */
  createMenu: {
    requestBody: {
      content: {
        "multipart/form-data": components["schemas"]["CreateMenuRequest"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        content: {
          "application/json": components["schemas"]["Menu"];
        };
      };
    };
  };
  /** Get a menu by ID */
  getMenuById: {
    parameters: {
      path: {
        menuId: string;
      };
    };
    responses: {
      /** @description A menu */
      200: {
        content: {
          "application/json": components["schemas"]["Menu"];
        };
      };
    };
  };
  /** Update menu pages */
  updateMenuPages: {
    parameters: {
      path: {
        menuId: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["MenuPage"][];
      };
    };
    responses: {
      /** @description Updated */
      200: {
        content: {
          "application/json": components["schemas"]["Menu"];
        };
      };
    };
  };
  /** Get all restaurants */
  getAllRestaurants: {
    responses: {
      /** @description A list of restaurants */
      200: {
        content: {
          "application/json": components["schemas"]["Restaurant"][];
        };
      };
    };
  };
  /** Create a restaurant */
  createRestaurant: {
    requestBody: {
      content: {
        "application/json": components["schemas"]["Restaurant"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        content: {
          "application/json": components["schemas"]["Restaurant"];
        };
      };
    };
  };
  /** Get a restaurant by ID */
  getRestaurantById: {
    parameters: {
      path: {
        restaurantId: string;
      };
    };
    responses: {
      /** @description A restaurant */
      200: {
        content: {
          "application/json": components["schemas"]["Restaurant"];
        };
      };
    };
  };
  /** Update a restaurant */
  updateRestaurant: {
    parameters: {
      path: {
        restaurantId: string;
      };
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["Restaurant"];
      };
    };
    responses: {
      /** @description Updated */
      200: {
        content: {
          "application/json": components["schemas"]["Restaurant"];
        };
      };
    };
  };
  /** Delete a restaurant */
  deleteRestaurant: {
    parameters: {
      path: {
        restaurantId: string;
      };
    };
    responses: {
      /** @description No content */
      204: {
        content: never;
      };
    };
  };
  /** Get all qr menus */
  getAllQrMenus: {
    responses: {
      /** @description A list of qr menus */
      200: {
        content: {
          "application/json": components["schemas"]["QrMenu"][];
        };
      };
    };
  };
  /** Create a qr menu */
  createQrMenu: {
    requestBody: {
      content: {
        "multipart/form-data": {
          /** Format: binary */
          file?: string;
          createRequest?: components["schemas"]["CreateQrMenuRequest"];
        };
        "application/json": components["schemas"]["CreateQrMenuRequest"];
      };
    };
    responses: {
      /** @description Created */
      201: {
        content: {
          "application/json": components["schemas"]["QrMenu"];
        };
      };
    };
  };
  /** Get a qr menu by ID */
  getQrMenuById: {
    parameters: {
      path: {
        qrMenuId: string;
      };
    };
    responses: {
      /** @description A qr menu */
      200: {
        content: {
          "application/json": components["schemas"]["QrMenu"];
        };
      };
    };
  };
  /** Update a qr menu */
  updateQrMenu: {
    parameters: {
      path: {
        qrMenuId: string;
      };
    };
    requestBody: {
      content: {
        "multipart/form-data": {
          /** Format: binary */
          file?: string;
          updateRequest?: components["schemas"]["UpdateQrMenuRequest"];
        };
        "application/json": components["schemas"]["QrMenu"];
      };
    };
    responses: {
      /** @description Updated */
      200: {
        content: {
          "application/json": components["schemas"]["QrMenu"];
        };
      };
    };
  };
  /** Delete a qr menu */
  deleteQrMenu: {
    parameters: {
      path: {
        qrMenuId: string;
      };
    };
    responses: {
      /** @description No content */
      204: {
        content: never;
      };
    };
  };
  /** Get a qr menu by URL suffix */
  getQrMenuBySuffix: {
    parameters: {
      path: {
        urlSuffix: string;
      };
    };
    responses: {
      /** @description A qr menu */
      200: {
        content: {
          "application/json": components["schemas"]["ReadonlyQrMenu"];
        };
      };
    };
  };
}
