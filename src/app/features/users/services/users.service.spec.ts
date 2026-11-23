import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { StateService } from '@core/services/state.service';
import { EventBusService, EventTypes } from '@core/services/event-bus.service';
import { UsersService } from './users.service';
import { User } from '../models/user.model';

describe('UsersService', () => {
  let service: UsersService;
  let state: StateService;
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [UsersService] });
    service = TestBed.inject(UsersService);
    state = TestBed.inject(StateService);
    eventBus = TestBed.inject(EventBusService);
  });

  it('loads the seeded users', fakeAsync(() => {
    let users: User[] = [];
    service.getUsers().subscribe(u => (users = u));
    tick(1000);
    expect(users.length).toBe(4);
  }));

  it('adds, updates and deletes users', fakeAsync(() => {
    let users: User[] = [];
    service.getUsers().subscribe(u => (users = u));
    tick(1000);

    service.addUser({ name: 'Grace Hopper', email: 'grace@example.com', role: 'Admin', status: 'active' }).subscribe();
    tick(1000);
    const added = users.find(u => u.email === 'grace@example.com')!;
    expect(added).toBeDefined();

    service.updateUser(added.id, { role: 'Manager' }).subscribe();
    tick(1000);
    expect(users.find(u => u.id === added.id)?.role).toBe('Manager');

    service.deleteUser(added.id).subscribe();
    tick(1000);
    expect(users.some(u => u.id === added.id)).toBeFalse();
  }));

  it('shares the selected user through StateService and the event bus', () => {
    const user: User = { id: '9', name: 'Ada', email: 'ada@example.com', role: 'User', status: 'active', joinedDate: new Date() };
    const events: unknown[] = [];
    eventBus.on(EventTypes.USER_SELECTED).subscribe(e => events.push(e.payload));

    service.selectUser(user);

    expect(state.getSelectedUser()).toEqual({ id: '9', name: 'Ada', email: 'ada@example.com' });
    expect(events).toEqual([user]);
  });

  it('clears shared selection when the selected user is deleted', fakeAsync(() => {
    state.setSelectedUser({ id: '1', name: 'John Doe', email: 'john.doe@example.com' });
    service.deleteUser('1').subscribe();
    tick(1000);
    expect(state.getSelectedUser()).toBeNull();
  }));
});
