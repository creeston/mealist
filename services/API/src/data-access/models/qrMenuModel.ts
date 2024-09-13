import { ObjectId } from 'mongodb';
import { model, Schema } from 'mongoose';
import { CreateQrMenuRequest, QrMenu, QrMenuItem } from '../../domain/models/qrmenu';
import { RestaurantModel } from './restaurantModel';
import { mapToMenu, MenuModel } from './menuModel';
import { mapToRestaurant } from './restaurantModel';

const QrMenuItemStyleSchema = new Schema({
  thumbnailIndex: Number,
  title: String,
});

const QrMenuItemSchema = new Schema({
  menu: Schema.Types.ObjectId,
  style: QrMenuItemStyleSchema,
});

const QrMenuStyleSchema = new Schema({
  displayName: { type: String, required: true },
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String, required: true },
  fontColor: { type: String, required: true },
  previewIndex: { type: Number, required: true },
});

const QrStatsSchema = new Schema({
  scanCount: { type: Number, required: true },
});

const QrMenuSchema = new Schema({
  name: String,
  restaurant: Schema.Types.ObjectId,
  style: { type: QrMenuStyleSchema, required: true },
  items: [QrMenuItemSchema],
  urlSuffix: { type: String, required: true },
  stats: { type: QrStatsSchema, required: true },
  creationDate: { type: String, required: true },
  modificationDate: { type: String, required: true },
});

export const QrMenuModel = model('QrMenu', QrMenuSchema);

export const mapToQrMenuModel = (qrMenu: QrMenu) => {
  return {
    name: qrMenu.name,
    restaurant: new ObjectId(qrMenu.restaurant.id),
    style: {
      displayName: qrMenu.style.displayName,
      primaryColor: qrMenu.style.primaryColor,
      secondaryColor: qrMenu.style.secondaryColor,
      fontColor: qrMenu.style.fontColor,
      previewIndex: qrMenu.style.previewIndex,
    },
    items: qrMenu.items.map((item) => ({
      menu: new ObjectId(item.menu.id),
      style: {
        thumbnailIndex: item.style.thumbnailIndex,
        title: item.style.title,
      },
    })),
    urlSuffix: qrMenu.urlSuffix,
    stats: {
      scanCount: qrMenu.stats.scanCount,
    },
    creationDate: qrMenu.creationDate,
    modificationDate: qrMenu.modificationDate,
  };
};

export const mapCreationRequestToQrMenuModel = (qrMenu: CreateQrMenuRequest) => {
  return {
    name: qrMenu.name,
    restaurant: new ObjectId(qrMenu.restaurantId),
    style: {
      displayName: qrMenu.style.displayName,
      primaryColor: qrMenu.style.primaryColor,
      secondaryColor: qrMenu.style.secondaryColor,
      fontColor: qrMenu.style.fontColor,
      previewIndex: qrMenu.style.previewIndex,
    },
    items: qrMenu.items.map((item) => ({
      menu: new ObjectId(item.menuId),
      style: {
        thumbnailIndex: item.style.thumbnailIndex,
        title: item.style.title,
      },
    })),
    urlSuffix: qrMenu.urlSuffix,
    stats: {
      scanCount: 0,
    },
    creationDate: qrMenu.creationDate,
  };
};

export const mapToQrMenu = async (qrMenu: any) => {
  const restaurant = await RestaurantModel.findById(qrMenu.restaurant);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const qrMenuItems = await Promise.all(
    qrMenu.items.map(async (item: any) => {
      const menu = await MenuModel.findById(item.menu);
      if (!menu) {
        throw new Error('Menu not found');
      }

      return {
        menu: mapToMenu(menu),
        style: item.style,
      } as QrMenuItem;
    })
  );

  return {
    id: qrMenu._id.toString(),
    name: qrMenu.name ?? '',
    restaurant: mapToRestaurant(restaurant),
    style: qrMenu.style,
    items: qrMenuItems,
    urlSuffix: qrMenu.urlSuffix,
    stats: qrMenu.stats,
    creationDate: qrMenu.creationDate,
    modificationDate: qrMenu.modificationDate,
  } as QrMenu;
};
