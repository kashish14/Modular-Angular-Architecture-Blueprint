import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * StateService - Shared state management across features
 * 
 * This service demonstrates how features communicate without direct dependencies.
 * Features can set and observe shared state through this centralized service.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Selected user state (shared between Users and Analytics modules)
  private selectedUserIdSubject = new BehaviorSubject<string | null>(null);
  public selectedUserId$ = this.selectedUserIdSubject.asObservable();

  // Application-wide loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Sidebar collapsed state
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  constructor() {}

  setSelectedUserId(userId: string | null): void {
    this.selectedUserIdSubject.next(userId);
  }

  getSelectedUserId(): string | null {
    return this.selectedUserIdSubject.value;
  }

  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  toggleSidebar(): void {
    this.sidebarCollapsedSubject.next(!this.sidebarCollapsedSubject.value);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
  }
}
