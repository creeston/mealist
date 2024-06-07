import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TranslateHelperClass {
  constructor(private translate: TranslateService) {}

  getCurrentLang(): string | undefined {
    let currentLang = this.translate.currentLang;
    if (currentLang == 'ru') {
      return 'ru-RU';
    } else if (currentLang == 'be') {
      return 'be-BY';
    } else {
      return undefined;
    }
  }
}
