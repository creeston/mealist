import { ObjectId } from 'mongodb';
import { model, Schema } from 'mongoose';
import { CreateQrMenuCommand, QrMenu, QrMenuItem } from '../../domain/models/qrmenu';
import { RestaurantModel } from './restaurantModel';
import { MenuModel, mapMenuPageModelToMenuPage, mapToMenu } from './menuModel';
import { mapToRestaurant } from './restaurantModel';

const QrMenuItemSchema = new Schema({
  menuId: Schema.Types.ObjectId,
  title: { type: String, required: true },
});

const QrMenuStyleSchema = new Schema({
  headerColor: { type: String, required: true },
  actionsColor: { type: String, required: true },
  fontColor: { type: String, required: true },
  backgroundColor: { type: String, required: true },
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
  loadingPlaceholderKey: { type: String, required: true },
  loadingPlaceholderMenuIndex: { type: Number, required: false },
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

export const mapCreationCommandToQrMenuModel = (
  command: CreateQrMenuCommand,
  creationDate: string,
  uploadedPlaceholderKey: string
) => {
  return {
    name: command.name,
    title: command.title,
    urlSuffix: command.urlSuffix,
    restaurantId: new ObjectId(command.restaurantId),
    sectionsToShow: command.sectionsToShow,
    style: command.style,
    menus: command.menus.map((item) => ({
      menuId: new ObjectId(item.menuId),
      title: item.title,
    })),
    stats: command.stats,
    loadingPlaceholderKey: uploadedPlaceholderKey,
    loadingPlaceholderMenuIndex: command.loadingPlaceholderMenuIndex,
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
        menu: mapToMenu(menuModel),
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
    loadingPlaceholderKey: qrMenu.loadingPlaceholderKey,
    loadingPlaceholderMenuIndex: qrMenu.loadingPlaceholderMenuIndex,
  } as QrMenu;
};
