export * from './code.service';
import { CodeService } from './code.service';
export * from './menus.service';
import { MenusService } from './menus.service';
export * from './restaurants.service';
import { RestaurantsService } from './restaurants.service';
export const APIS = [CodeService, MenusService, RestaurantsService];
