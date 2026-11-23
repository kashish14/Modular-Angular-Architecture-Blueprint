import { Component, OnDestroy, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { AppSettings } from '../../models/settings.model';

type ToggleKey = 'notifications' | 'darkMode' | 'autoSave';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  standalone: false
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  settings!: AppSettings;
  savedAt: Date | null = null;
  preview = '';
  private clock?: ReturnType<typeof setInterval>;

  toggles: { key: ToggleKey; label: string; description: string }[] = [
    { key: 'darkMode', label: 'Dark mode', description: 'Applied app-wide by the core ThemeService via the event bus' },
    { key: 'notifications', label: 'Email notifications', description: 'Stored preference, sent with SETTINGS_CHANGED events' },
    { key: 'autoSave', label: 'Auto save drafts', description: 'Stored preference, sent with SETTINGS_CHANGED events' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (New York)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Asia/Kolkata', label: 'India (Kolkata)' }
  ];

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();
    this.updatePreview();
    this.clock = setInterval(() => this.updatePreview(), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.clock);
  }

  save(patch: Partial<AppSettings>): void {
    this.settingsService.updateSettings(patch);
    this.savedAt = new Date();
    this.updatePreview();
  }

  saveToggle(key: ToggleKey, value: boolean): void {
    this.save({ [key]: value });
  }

  reset(): void {
    this.settingsService.resetSettings();
    this.settings = this.settingsService.getSettings();
    this.savedAt = new Date();
    this.updatePreview();
  }

  /** Shows the effect of language + timezone on date formatting. */
  private updatePreview(): void {
    this.preview = new Intl.DateTimeFormat(this.settings.language, {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: this.settings.timezone
    }).format(new Date());
  }
}
