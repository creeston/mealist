export * from './menus.service';
import { MenusService } from './menus.service';
export * from './qr.service';
import { QrService } from './qr.service';
export * from './qrmenus.service';
import { QrmenusService } from './qrmenus.service';
export * from './restaurants.service';
import { RestaurantsService } from './restaurants.service';
export const APIS = [MenusService, QrService, QrmenusService, RestaurantsService];
