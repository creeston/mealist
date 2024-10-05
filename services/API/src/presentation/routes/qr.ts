import { Router } from 'express';
import { qrMenuService } from './qrmenus';
import { components } from '../api';
import { QrMenu, QrMenuItem } from '../../domain/models/qrmenu';
import { StorageService } from '../../data-access/storage/storageService';
import { mapMenuPageToApiModel } from './menus';

type ReadonlyQrMenuResponseModel = components['schemas']['ReadonlyQrMenu'];
type ReadonlyQrMenuItem = components['schemas']['ReadonlyQrMenuItem'];
type ReadonlyRestaurant = components['schemas']['ReadonlyRestaurant'];

const storageService = new StorageService();
export const router = Router();

router.get('/:urlSuffix', async (req, res) => {
  const urlSuffix = req.params.urlSuffix as string;
  const qrMenu = await qrMenuService.getQrMenuByUrlSuffix(urlSuffix);

  if (!qrMenu) {
    res.status(404).send();
    return;
  }

  const qrMenuResponse = await mapDomainToApiModel(qrMenu);

  res.status(200).json(qrMenuResponse);
});

const mapDomainToApiModel = async (qrMenu: QrMenu): Promise<ReadonlyQrMenuResponseModel> => {
  const loadingPlaceholderUrl = storageService.getFileFromPublicBucket(qrMenu.loadingPlaceholderKey);
  const menus = await Promise.all(qrMenu.menus.map(mapQrMenuItemToApiModel));
  const response: ReadonlyQrMenuResponseModel = {
    title: qrMenu.title,
    restaurant: mapRestaurantToApiModel(qrMenu.restaurant),
    sectionsToShow: qrMenu.sectionsToShow,
    style: qrMenu.style,
    loadingPlaceholderUrl: loadingPlaceholderUrl,
    menus: menus,
  };

  return response;
};

const mapQrMenuItemToApiModel = async (qrMenuItem: QrMenuItem): Promise<ReadonlyQrMenuItem> => {
  const pages = await Promise.all(qrMenuItem.menu!.pages!.map(mapMenuPageToApiModel));
  return {
    stopColor: qrMenuItem.stopColor,
    stopStyle: qrMenuItem.stopStyle,
    title: qrMenuItem.title,
    pages: pages,
  } as ReadonlyQrMenuItem;
};

const mapRestaurantToApiModel = (restaurant: ReadonlyRestaurant): ReadonlyRestaurant => {
  return {
    name: restaurant.name,
    address: restaurant.address,
    city: restaurant.city,
    description: restaurant.description,
    wifiName: restaurant.wifiName,
    wifiPassword: restaurant.wifiPassword,
    facebookUrl: restaurant.facebookUrl,
    instagramUrl: restaurant.instagramUrl,
    tripAdvisorUrl: restaurant.tripAdvisorUrl,
  };
};
