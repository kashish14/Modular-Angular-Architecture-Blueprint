import { TestBed } from '@angular/core/testing';
import { EventBusService, EventTypes } from './event-bus.service';
import { SETTINGS_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies the persisted theme on startup', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ darkMode: true }));
    TestBed.inject(ThemeService);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('reacts to SETTINGS_CHANGED events', () => {
    TestBed.inject(ThemeService);
    const bus = TestBed.inject(EventBusService);

    bus.emit(EventTypes.SETTINGS_CHANGED, { darkMode: true });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    bus.emit(EventTypes.SETTINGS_CHANGED, { darkMode: false });
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
