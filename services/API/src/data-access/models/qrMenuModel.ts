import { ObjectId } from 'mongodb';
import { model, Schema } from 'mongoose';
import { CreateQrMenuRequest, QrMenu, QrMenuItem } from '../../domain/models/qrmenu';
import { RestaurantModel } from './restaurantModel';
import { MenuModel, mapMenuPageModelToMenuPage } from './menuModel';
import { mapToRestaurant } from './restaurantModel';

const QrMenuItemSchema = new Schema({
  menuId: Schema.Types.ObjectId,
  title: { type: String, required: true },
});

const QrMenuStyleSchema = new Schema({
  headerColor: { type: String, required: true },
  actionsColor: { type: String, required: true },
  fontColor: { type: String, required: true },
  backgroundColor: { type: Number, required: true },
});

const QrStatsSchema = new Schema({
  scanCount: { type: Number, required: true },
});

const QrMenuSchema = new Schema({
  name: { type: String, required: true },
  urlSuffix: { type: String, required: true },
  restaurantId: { type: Schema.Types.ObjectId, required: true },
  sectionsToShow: { type: [String], required: true },
  title: { type: String, required: true },
  style: { type: QrMenuStyleSchema, required: true },
  menus: { type: [QrMenuItemSchema], required: true },
  stats: { type: QrStatsSchema, required: true },
  creationDate: { type: String, required: true },
  modificationDate: { type: String, required: false },
});

export const QrMenuModel = model('QrMenu', QrMenuSchema);

// export const mapToQrMenuModel = (qrMenu: QrMenu) => {
//   return {
//     name: qrMenu.name,
//     restaurant: new ObjectId(qrMenu.restaurant.id),
//     style: {
//       displayName: qrMenu.style.,
//       primaryColor: qrMenu.style.headerColor,
//       secondaryColor: qrMenu.style.secondaryColor,
//       fontColor: qrMenu.style.fontColor,
//       previewIndex: qrMenu.style.previewIndex,
//     },
//     items: qrMenu.menus.map((item) => ({
//       menu: new ObjectId(item.menu.id),
//       style: {
//         thumbnailIndex: item.style.thumbnailIndex,
//         title: item.style.title,
//       },
//     })),
//     urlSuffix: qrMenu.urlSuffix,
//     stats: {
//       scanCount: qrMenu.stats.scanCount,
//     },
//     creationDate: qrMenu.creationDate,
//     modificationDate: qrMenu.modificationDate,
//   };
// };

export const mapCreationRequestToQrMenuModel = (qrMenu: CreateQrMenuRequest, creationDate: string) => {
  return {
    name: qrMenu.name,
    title: qrMenu.title,
    urlSuffix: qrMenu.urlSuffix,
    restaurantId: new ObjectId(qrMenu.restaurantId),
    sectionsToShow: qrMenu.sectionsToShow,
    style: qrMenu.style,
    menus: qrMenu.menus.map((item) => ({
      menuId: new ObjectId(item.menuId),
      title: item.title,
    })),
    stats: {
      scanCount: 0,
    },
    creationDate: creationDate,
  };
};

export const mapModelToQrMenu = async (qrMenu: any) => {
  const restaurant = await RestaurantModel.findById(qrMenu.restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const qrMenuItems = await Promise.all(
    qrMenu.menus.map(async (menu: any) => {
      const menuModel = await MenuModel.findById(menu.menuId);
      if (!menuModel) {
        throw new Error('Menu not found');
      }

      return {
        pages: menuModel.pages?.map(mapMenuPageModelToMenuPage),
        title: menu.title,
        stopColor: '#fff', // menuModel.stopColor,
        stopStyle: 'underline', //. menuModel.stopStyle,
      } as QrMenuItem;
    })
  );

  return {
    id: qrMenu._id.toString(),
    name: qrMenu.name ?? '',
    urlSuffix: qrMenu.urlSuffix,
    title: qrMenu.title,
    restaurant: mapToRestaurant(restaurant),
    sectionsToShow: qrMenu.sectionsToShow,
    style: qrMenu.style,
    menus: qrMenuItems,
    stats: qrMenu.stats,
    creationDate: qrMenu.creationDate,
    modificationDate: qrMenu.modificationDate,
  } as QrMenu;
};
