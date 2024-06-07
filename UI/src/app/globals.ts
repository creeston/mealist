import { Injectable } from "@angular/core";
import { UserProfile } from "./services/auth.service";


@Injectable({
  providedIn: 'root',
})
export class Globals {
  role = 'client';
  isLogged = false;
  email = '';
  userId = ''
  userProfile: UserProfile | null = null;
  restsCount: number = -1;
  menusCount: number = -1;
  qrMenusCount: number = -1;
  navbarDisabled = false
}