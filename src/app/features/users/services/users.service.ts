import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { StateService } from '@core/services/state.service';
import { EventBusService, EventTypes } from '@core/services/event-bus.service';

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'active',
    joinedDate: new Date('2023-01-15'),
    lastActive: new Date()
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    joinedDate: new Date('2023-03-22'),
    lastActive: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'User',
    status: 'inactive',
    joinedDate: new Date('2023-05-10'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    role: 'Manager',
    status: 'active',
    joinedDate: new Date('2023-02-01'),
    lastActive: new Date(Date.now() - 1000 * 60 * 5)
  }
];

/** Simulated network latency for the in-memory API. */
const LATENCY_MS = 400;

@Injectable()
export class UsersService {
  private usersSubject = new BehaviorSubject<User[]>(MOCK_USERS);
  public users$ = this.usersSubject.asObservable();

  constructor(
    private stateService: StateService,
    private eventBus: EventBusService
  ) {}

  /** Emits the user list after an initial simulated load, then on every change. */
  getUsers(): Observable<User[]> {
    return timer(LATENCY_MS).pipe(switchMap(() => this.users$));
  }

  getUserById(id: string): Observable<User | undefined> {
    return this.users$.pipe(
      map(users => users.find(u => u.id === id)),
      delay(LATENCY_MS)
    );
  }

  addUser(userData: Omit<User, 'id' | 'joinedDate' | 'lastActive'>): Observable<User> {
    const newUser: User = {
      id: String(Date.now()),
      ...userData,
      joinedDate: new Date()
    };

    return of(newUser).pipe(
      delay(LATENCY_MS),
      tap(user => {
        this.usersSubject.next([...this.usersSubject.value, user]);
        this.eventBus.emit(EventTypes.USER_UPDATED, user);
      })
    );
  }

  updateUser(id: string, userData: Partial<User>): Observable<User | undefined> {
    const current = this.usersSubject.value.find(u => u.id === id);
    if (!current) {
      return of(undefined).pipe(delay(LATENCY_MS));
    }

    const updatedUser = { ...current, ...userData, id };
    return of(updatedUser).pipe(
      delay(LATENCY_MS),
      tap(user => {
        this.usersSubject.next(this.usersSubject.value.map(u => (u.id === id ? user : u)));
        if (this.stateService.getSelectedUser()?.id === id) {
          this.stateService.setSelectedUser({ id, name: user.name, email: user.email });
        }
        this.eventBus.emit(EventTypes.USER_UPDATED, user);
      })
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return of(true).pipe(
      delay(LATENCY_MS),
      tap(() => {
        this.usersSubject.next(this.usersSubject.value.filter(u => u.id !== id));
        if (this.stateService.getSelectedUser()?.id === id) {
          this.stateService.setSelectedUser(null);
        }
        this.eventBus.emit(EventTypes.USER_DELETED, { id });
      })
    );
  }

  selectUser(user: User): void {
    // Shared state: read by the Dashboard feature without importing this module.
    this.stateService.setSelectedUser({ id: user.id, name: user.name, email: user.email });
    this.eventBus.emit(EventTypes.USER_SELECTED, user);
  }
}
