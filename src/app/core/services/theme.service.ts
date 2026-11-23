import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { EventBusService, EventTypes } from './event-bus.service';

export const SETTINGS_STORAGE_KEY = 'app_settings';

/**
 * Applies the dark/light theme to the document.
 *
 * The Settings feature never talks to the shell directly: it persists its
 * settings and emits SETTINGS_CHANGED on the event bus. This service reads the
 * persisted value on startup and reacts to that event afterwards.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private document = inject(DOCUMENT);

  constructor(eventBus: EventBusService) {
    this.apply(this.readStoredDarkMode());
    eventBus
      .on<{ darkMode?: boolean }>(EventTypes.SETTINGS_CHANGED)
      .subscribe(event => this.apply(!!event.payload?.darkMode));
  }

  apply(dark: boolean): void {
    this.document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  private readStoredDarkMode(): boolean {
    try {
      return !!JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}').darkMode;
    } catch {
      return false;
    }
  }
}
