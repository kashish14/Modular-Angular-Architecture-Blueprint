import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings } from '../models/settings.model';
import { EventBusService, EventTypes } from '@core/services/event-bus.service';

const DEFAULT_SETTINGS: AppSettings = {
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
    return this.settingsSubject.value;
  }

  updateSettings(settings: Partial<AppSettings>): void {
    const updated = { ...this.settingsSubject.value, ...settings };
    this.settingsSubject.next(updated);
    this.saveSettings(updated);
    
    // Emit event for other modules
    this.eventBus.emit(EventTypes.SETTINGS_CHANGED, updated);
  }

  private loadSettings(): AppSettings {
    const stored = localStorage.getItem('app_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  }

  private saveSettings(settings: AppSettings): void {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }
}
