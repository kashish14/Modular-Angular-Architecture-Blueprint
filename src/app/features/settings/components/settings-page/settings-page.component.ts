import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { AppSettings } from '../../models/settings.model';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {
  settings: AppSettings = {
    notifications: false,
    darkMode: false,
    autoSave: false,
    language: 'en',
    timezone: 'UTC'
  };

  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' }
  ];

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settings = this.settingsService.getSettings();
  }

  onToggleChange(setting: keyof AppSettings): void {
    this.settingsService.updateSettings({ [setting]: this.settings[setting] });
  }

  onSelectChange(setting: keyof AppSettings, value: string): void {
    this.settings = { ...this.settings, [setting]: value };
    this.settingsService.updateSettings({ [setting]: value });
  }
}
