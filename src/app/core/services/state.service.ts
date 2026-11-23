import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Minimal, feature-agnostic view of a user that features can share. */
export interface SelectedUser {
  id: string;
  name: string;
  email: string;
}

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
  // Selected user (written by the Users feature, read by the Dashboard feature)
  private selectedUserSubject = new BehaviorSubject<SelectedUser | null>(null);
  public selectedUser$ = this.selectedUserSubject.asObservable();

  // Application-wide loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  // Sidebar collapsed state
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  setSelectedUser(user: SelectedUser | null): void {
    this.selectedUserSubject.next(user);
  }

  getSelectedUser(): SelectedUser | null {
    return this.selectedUserSubject.value;
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
