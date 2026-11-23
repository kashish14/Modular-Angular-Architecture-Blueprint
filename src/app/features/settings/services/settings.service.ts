import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AppSettings } from '../models/settings.model';
import { EventBusService, EventTypes } from '@core/services/event-bus.service';
import { SETTINGS_STORAGE_KEY } from '@core/services/theme.service';

export const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  darkMode: false,
  autoSave: true,
  language: 'en',
  timezone: 'UTC'
};

@Injectable()
export class SettingsService {
  private settingsSubject = new BehaviorSubject<AppSettings>(this.loadSettings());
  public settings$ = this.settingsSubject.asObservable();

  constructor(private eventBus: EventBusService) {}

  getSettings(): AppSettings {
    return { ...this.settingsSubject.value };
  }

  resetSettings(): void {
    this.updateSettings(DEFAULT_SETTINGS);
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const updated = { ...this.settingsSubject.value, ...settings };
    this.settingsSubject.next(updated);
    this.saveSettings(updated);
    
    // Emit event for other modules
    this.eventBus.emit(EventTypes.SETTINGS_CHANGED, updated);
  }

  private loadSettings(): AppSettings {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) ?? '{}') };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private saveSettings(settings: AppSettings): void {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }
}
