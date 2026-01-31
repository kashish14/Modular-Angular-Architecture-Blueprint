# Dependency Management

## Overview

This document defines the **dependency management strategy** for the application, including allowed dependency directions, Dependency Injection (DI) patterns, service ownership, and coupling prevention.

## Dependency Direction Rules

### The Golden Rule

**Dependencies flow in ONE direction: from outer to inner layers**

```
┌──────────────────────┐
│   Feature Modules    │ ← Can depend on Shared & Core
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Shared Layer       │ ← Can depend on Core only
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   Core Layer         │ ← Depends on nothing (except Angular)
└──────────────────────┘
```

### Allowed Dependencies

| Layer    | Can Import From            | Cannot Import From           |
|----------|----------------------------|------------------------------|
| Core     | Angular, RxJS, 3rd party   | Shared, Features             |
| Shared   | Core, Angular, RxJS        | Features                     |
| Features | Core, Shared, Angular      | Other Features               |

### Why This Matters

**Without rules:**
```
UsersModule → AnalyticsModule → SettingsModule → UsersModule
❌ Circular dependency - build fails
```

**With rules:**
```
UsersModule → StateService (Core)
AnalyticsModule → StateService (Core)
✅ Both depend on abstraction, not each other
```

---

## Dependency Injection Strategy

### 1. Core Services (Application-Wide Singletons)

**Provided in:** `{ providedIn: 'root' }`

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  login(credentials: Credentials): Observable<User> {
    return this.apiService.post<User>('/auth/login', credentials)
      .pipe(
        tap(user => this.currentUserSubject.next(user))
      );
  }
}
```

**Why `providedIn: 'root'`:**
- Tree-shakable (removed if not used)
- Singleton by default
- No need to add to module providers
- Better for lazy-loaded modules

**Core Services:**
- `AuthService` - Authentication state
- `ApiService` - HTTP abstraction
- `StateService` - Shared state
- `EventBusService` - Cross-module events
- `ConfigService` - Application config
- `LoggerService` - Logging abstraction

---

### 2. Shared Services (Utility Services)

**Provided in:** Feature modules or `{ providedIn: 'root' }`

```typescript
@Injectable({ providedIn: 'root' })
export class DateUtilService {
  formatDate(date: Date, format: string): string {
    // Utility logic
  }
}
```

**Characteristics:**
- Stateless
- Pure functions
- No business logic
- Highly reusable

---

### 3. Feature Services (Domain-Specific Logic)

**Provided in:** Feature module only

```typescript
@Injectable()
export class AnalyticsService {
  constructor(private apiService: ApiService) {}

  getMetrics(): Observable<Metrics> {
    return this.apiService.get<Metrics>('/analytics/metrics');
  }

  calculateGrowth(data: DataPoint[]): number {
    // Feature-specific logic
  }
}
```

**Provided in module:**
```typescript
@NgModule({
  providers: [AnalyticsService]  // New instance per module
})
export class AnalyticsModule { }
```

**Why not `providedIn: 'root'`:**
- Scoped to feature (garbage collected when module destroyed)
- Prevents accidental usage in other features
- Clear ownership

---

### 4. Component Services (Component-Scoped)

**Provided in:** Component decorator

```typescript
@Component({
  selector: 'app-user-list',
  providers: [UserListService]  // New instance per component
})
export class UserListComponent {
  constructor(private userListService: UserListService) {}
}
```

**Use when:**
- Service manages component-specific state
- Multiple instances needed
- Service lifecycle = component lifecycle

---

## Service Ownership

### Core Services (Platform Team Owns)

**Responsibilities:**
- Authentication
- HTTP communication
- Global state
- Error handling
- Logging

**Change Process:**
1. RFC (Request for Comments)
2. Review by tech leads
3. Version bump (semver)
4. Migration guide if breaking

**Why strict ownership:**
- Core services are infrastructure
- Breaking changes affect all features
- Require careful testing

---

### Shared Services (UI/Platform Team Owns)

**Responsibilities:**
- Utility functions
- Common UI logic
- Formatting/parsing
- Validation helpers

**Change Process:**
1. Pull request review
2. Unit tests required
3. Backward compatibility preferred

---

### Feature Services (Feature Team Owns)

**Responsibilities:**
- Domain business logic
- Feature-specific API calls
- Local state management

**Change Process:**
1. Feature team discretion
2. No cross-team approval needed
3. Isolated impact

---

## Avoiding Tight Coupling

### Anti-Pattern 1: Direct Module Imports

❌ **Bad:**
```typescript
// analytics.component.ts
import { UsersService } from '../../users/services/users.service';

export class AnalyticsComponent {
  constructor(private usersService: UsersService) {}
}
```

**Problems:**
- Creates hidden dependency
- Breaks module isolation
- Prevents independent deployment

✅ **Good:**
```typescript
// analytics.component.ts
import { StateService } from '@core/services/state.service';

export class AnalyticsComponent {
  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.stateService.selectedUser$.subscribe(user => {
      // React to shared state
    });
  }
}
```

---

### Anti-Pattern 2: Shared Mutable State

❌ **Bad:**
```typescript
// global-state.ts
export const GLOBAL_STATE = {
  currentUser: null,
  settings: {}
};

// feature-a.component.ts
GLOBAL_STATE.currentUser = user;  // Mutation

// feature-b.component.ts
const user = GLOBAL_STATE.currentUser;  // Reads mutation
```

**Problems:**
- No change detection
- Race conditions
- Impossible to debug
- Breaks tree shaking

✅ **Good:**
```typescript
@Injectable({ providedIn: 'root' })
export class StateService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
```

**Benefits:**
- Reactive (Observable)
- Immutable
- Type-safe
- Testable

---

### Anti-Pattern 3: Service Locator Pattern

❌ **Bad:**
```typescript
export class AnalyticsComponent {
  constructor(private injector: Injector) {}

  loadData(): void {
    const service = this.injector.get(UsersService);  // Hidden dependency
    service.getUsers().subscribe();
  }
}
```

**Problems:**
- Hides dependencies
- Breaks static analysis
- No compile-time checking

✅ **Good:**
```typescript
export class AnalyticsComponent {
  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}  // Dependencies explicit
}
```

---

## Dependency Inversion Principle

### Principle

**"Depend on abstractions, not concretions"**

### Example: API Service

**Abstraction (Core Layer):**
```typescript
export abstract class ApiService {
  abstract get<T>(url: string, options?: any): Observable<T>;
  abstract post<T>(url: string, body: any, options?: any): Observable<T>;
  abstract put<T>(url: string, body: any, options?: any): Observable<T>;
  abstract delete<T>(url: string, options?: any): Observable<T>;
}
```

**Implementation (Core Layer):**
```typescript
@Injectable({ providedIn: 'root' })
export class HttpApiService implements ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, options?: any): Observable<T> {
    return this.http.get<T>(url, options);
  }

  // ... other methods
}
```

**Provide abstraction:**
```typescript
@NgModule({
  providers: [
    { provide: ApiService, useClass: HttpApiService }
  ]
})
export class CoreModule { }
```

**Feature consumption:**
```typescript
export class UsersService {
  constructor(private apiService: ApiService) {}  // Depends on abstraction

  getUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('/users');
  }
}
```

**Benefits:**
- Easy to swap implementations (HttpApiService → MockApiService)
- Testability (mock the abstraction)
- Flexibility (WebSocket API, GraphQL API, etc.)

---

## Communication Patterns

### Pattern 1: Service-to-Service (Same Layer)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private apiService: ApiService,
    private stateService: StateService
  ) {}

  login(credentials: Credentials): Observable<User> {
    return this.apiService.post<User>('/auth/login', credentials)
      .pipe(
        tap(user => this.stateService.setCurrentUser(user))
      );
  }
}
```

**Rule:** Core services can depend on other Core services.

---

### Pattern 2: Feature-to-Core Communication

```typescript
@Injectable()
export class AnalyticsService {
  constructor(
    private apiService: ApiService,  // Core
    private authService: AuthService  // Core
  ) {}

  getMetrics(): Observable<Metrics> {
    const userId = this.authService.currentUserId;
    return this.apiService.get<Metrics>(`/analytics/${userId}`);
  }
}
```

**Rule:** Feature services inject Core services.

---

### Pattern 3: Feature-to-Feature Communication (Decoupled)

**❌ Don't:**
```typescript
// Feature A
export class UsersService {
  userSelected = new Subject<User>();
}

// Feature B
export class AnalyticsComponent {
  constructor(private usersService: UsersService) {}  // Direct coupling
}
```

**✅ Do:**
```typescript
// Core
@Injectable({ providedIn: 'root' })
export class StateService {
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  selectUser(user: User): void {
    this.selectedUserSubject.next(user);
  }
}

// Feature A
export class UsersComponent {
  constructor(private stateService: StateService) {}

  onUserClick(user: User): void {
    this.stateService.selectUser(user);
    this.router.navigate(['/analytics']);
  }
}

// Feature B
export class AnalyticsComponent {
  constructor(private stateService: StateService) {}

  ngOnInit(): void {
    this.stateService.selectedUser$.subscribe(user => {
      if (user) this.loadUserAnalytics(user.id);
    });
  }
}
```

---

## Preventing Circular Dependencies

### Detection Tools

**1. Madge (Circular Dependency Detector)**
```bash
npm install -g madge
madge --circular --extensions ts src/
```

**2. Webpack Warning**
```
WARNING in Circular dependency detected:
src/app/features/users/users.service.ts ->
src/app/features/analytics/analytics.service.ts ->
src/app/features/users/users.service.ts
```

**3. ESLint Plugin**
```json
{
  "plugins": ["import"],
  "rules": {
    "import/no-cycle": "error"
  }
}
```

---

### Breaking Circular Dependencies

**Scenario:**
```
UserService → AnalyticsService → UserService
```

**Solution 1: Extract to Core**
```typescript
@Injectable({ providedIn: 'root' })
export class UserAnalyticsService {
  getUserMetrics(userId: string): Observable<Metrics> {
    // Shared logic
  }
}

// Both features inject UserAnalyticsService
```

**Solution 2: Use Events**
```typescript
// User service
this.eventBus.emit({ type: 'USER_SELECTED', payload: user });

// Analytics service
this.eventBus.events$
  .pipe(filter(e => e.type === 'USER_SELECTED'))
  .subscribe(event => this.loadAnalytics(event.payload));
```

---

## Testing Strategy

### 1. Service Unit Tests

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: ApiService, useValue: apiSpy }
      ]
    });

    service = TestBed.inject(UsersService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should fetch users', () => {
    const mockUsers = [{ id: '1', name: 'Test' }];
    apiService.get.and.returnValue(of(mockUsers));

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });
  });
});
```

---

### 2. Dependency Rule Tests

```typescript
describe('Architecture', () => {
  it('features should not import other features', () => {
    const files = glob.sync('src/app/features/**/*.ts');

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const imports = content.match(/from ['"].*features\/(?!.*\.\.\/)/g);

      expect(imports).toBeNull();
    });
  });
});
```

---

## Summary

### Core Principles

1. **Unidirectional dependencies** - Outer layers depend on inner layers
2. **Dependency Inversion** - Depend on abstractions, not implementations
3. **Singleton Core services** - Shared infrastructure via `providedIn: 'root'`
4. **Feature isolation** - No cross-feature imports
5. **Observable communication** - Reactive, decoupled messaging

### Benefits

- **Testability** - Easy to mock dependencies
- **Maintainability** - Clear ownership and boundaries
- **Scalability** - Add features without touching others
- **Flexibility** - Swap implementations easily
- **Team velocity** - Independent development

### Red Flags

🚩 Feature importing another feature  
🚩 Circular dependency warnings  
🚩 Global mutable state  
🚩 Service locator pattern  
🚩 Hard-coded dependencies  

**When you see these → refactor immediately.**
