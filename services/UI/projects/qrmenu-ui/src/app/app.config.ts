import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  heroArrowLeft,
  heroEye,
  heroClipboard,
} from '@ng-icons/heroicons/outline';
import { NgIconsModule } from '@ng-icons/core';
import { ApiModule, Configuration, ConfigurationParameters } from './api';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: 'http://localhost:3000',
  };
  return new Configuration(params);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    NgIconsModule.withIcons({ heroArrowLeft, heroEye, heroClipboard })
      .providers!,
    ApiModule.forRoot(apiConfigFactory).providers!,
  ],
};
