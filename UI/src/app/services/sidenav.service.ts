import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ScreenService } from './screen.service';

@Injectable()
export class SidenavService {
  private sidenav: MatSidenav | null = null;
  private WIDTH_THRESHOLD = 1500;

  constructor(private screen: ScreenService) {}

  public setSidenav(sidenav: MatSidenav) {
    this.sidenav = sidenav;
  }

  public open() {
    return this.sidenav?.open();
  }

  public openIfNeeded() {
    if (screen.width >= this.WIDTH_THRESHOLD) {
      this.sidenav?.open();
    }
  }

  public close() {
    return this.sidenav?.close();
  }

  public toggle(): void {
    this.sidenav?.toggle();
  }
}
