import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppEvent } from '../models/common.model';

/**
 * EventBusService - Decoupled cross-module communication
 * 
 * Enables features to communicate without direct dependencies.
 * Features emit events, other features subscribe to specific event types.
 */
@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private eventSubject = new Subject<AppEvent>();
  public events$ = this.eventSubject.asObservable();

  constructor() {}

  /**
   * Emit an event to all subscribers
   */
  emit<T = any>(type: string, payload?: T): void {
    const event: AppEvent<T> = {
      type,
      payload,
      timestamp: Date.now()
    };
    this.eventSubject.next(event);
  }

  /**
   * Listen to specific event types
   */
  on<T = any>(eventType: string): Observable<AppEvent<T>> {
    return this.events$.pipe(
      filter(event => event.type === eventType)
    );
  }
}

// Event type constants for type safety
export const EventTypes = {
  USER_SELECTED: 'USER_SELECTED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
  NOTIFICATION: 'NOTIFICATION'
} as const;
