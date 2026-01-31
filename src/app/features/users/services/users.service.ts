import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=4F46E5&color=fff',
    joinedDate: new Date('2023-01-15'),
    lastActive: new Date()
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=10B981&color=fff',
    joinedDate: new Date('2023-03-22'),
    lastActive: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'User',
    status: 'inactive',
    avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=EF4444&color=fff',
    joinedDate: new Date('2023-05-10'),
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    role: 'Manager',
    status: 'active',
    avatar: 'https://ui-avatars.com/api/?name=Alice+Williams&background=F59E0B&color=fff',
    joinedDate: new Date('2023-02-01'),
    lastActive: new Date(Date.now() - 1000 * 60 * 5)
  }
];

@Injectable()
export class UsersService {
  private usersSubject = new BehaviorSubject<User[]>(MOCK_USERS);
  public users$ = this.usersSubject.asObservable();

  constructor(
    private stateService: StateService,
    private eventBus: EventBusService
  ) {}

  getUsers(): Observable<User[]> {
    return this.users$.pipe(delay(500));
  }

  getUserById(id: string): Observable<User | undefined> {
    return this.users$.pipe(
      map(users => users.find(u => u.id === id)),
      delay(300)
    );
  }

  addUser(userData: Omit<User, 'id' | 'avatar' | 'joinedDate' | 'lastActive'>): Observable<User> {
    const newUser: User = {
      id: String(Date.now()),
      ...userData,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&color=fff`,
      joinedDate: new Date(),
      lastActive: new Date()
    };

    const currentUsers = this.usersSubject.value;
    this.usersSubject.next([...currentUsers, newUser]);

    // Emit event
    this.eventBus.emit(EventTypes.USER_UPDATED, newUser);

    return of(newUser).pipe(delay(500));
  }

  updateUser(id: string, userData: Partial<User>): Observable<User | undefined> {
    const currentUsers = this.usersSubject.value;
    const userIndex = currentUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return of(undefined).pipe(delay(300));
    }

    const updatedUser = { ...currentUsers[userIndex], ...userData };
    const newUsers = [...currentUsers];
    newUsers[userIndex] = updatedUser;
    this.usersSubject.next(newUsers);

    // Emit event
    this.eventBus.emit(EventTypes.USER_UPDATED, updatedUser);

    return of(updatedUser).pipe(delay(500));
  }

  deleteUser(id: string): Observable<boolean> {
    const currentUsers = this.usersSubject.value;
    const newUsers = currentUsers.filter(u => u.id !== id);
    this.usersSubject.next(newUsers);

    // Emit event
    this.eventBus.emit(EventTypes.USER_DELETED, { id });

    return of(true).pipe(delay(500));
  }

  selectUser(user: User): void {
    // Update shared state
    this.stateService.setSelectedUserId(user.id);
    
    // Emit event for other modules
    this.eventBus.emit(EventTypes.USER_SELECTED, user);
  }
}
