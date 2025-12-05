import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { MarkdownModule, MARKED_OPTIONS } from 'ngx-markdown';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(), 
    provideAnimationsAsync(),
    importProvidersFrom(MarkdownModule.forRoot()),
    { provide: MARKED_OPTIONS, useValue: { gfm: true, breaks: true } }
  ]
};
