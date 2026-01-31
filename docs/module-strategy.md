# Module Strategy

## Overview

This document explains the **modularization strategy** used in this application, including module boundaries, lazy loading implementation, isolation patterns, and Module Federation setup.

## Module Types

### 1. Core Module (Singleton)

**Location:** `/src/app/core`

**Purpose:** Application-wide singleton services and infrastructure

**Contents:**
- Authentication service
- HTTP interceptors
- API client abstraction
- Global state management
- Configuration providers
- Error handling

**Import Strategy:**
```typescript
@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    AuthService,
    ApiService,
    StateService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
})
export class CoreModule {
  // Prevent re-import
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
```

**Why Singleton:**
- Authentication state must be consistent
- HTTP interceptors should register once
- API configuration is global
- Prevents memory leaks from duplicate services

---

### 2. Shared Module (Reusable)

**Location:** `/src/app/shared`

**Purpose:** Presentational components, pipes, and directives used across features

**Contents:**
- UI components (buttons, cards, modals)
- Utility pipes (date formatting, filtering)
- Structural directives (permission checks)
- Common interfaces and types

**Import Strategy:**
```typescript
@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    ModalComponent,
    DateFormatPipe,
    FilterPipe
  ],
  imports: [CommonModule],
  exports: [
    // Re-export commonly used Angular modules
    CommonModule,
    // Export all shared components
    ButtonComponent,
    CardComponent,
    ModalComponent,
    DateFormatPipe,
    FilterPipe
  ]
})
export class SharedModule { }
```

**Design Principles:**
- **No business logic** - only presentation
- **Stateless** - data flows in via @Input
- **Reusable** - works in any feature context
- **Tested in isolation** - no feature dependencies

---

### 3. Feature Modules (Business Domains)

**Location:** `/src/app/features/*`

**Purpose:** Encapsulate business logic for specific domains

**Structure (per feature):**
```
/analytics
  /components      ← UI components specific to analytics
  /services        ← Business logic services
  /models          ← Domain interfaces and types
  /guards          ← Route guards
  analytics.module.ts
  analytics-routing.module.ts
```

**Example Module:**
```typescript
@NgModule({
  declarations: [
    AnalyticsDashboardComponent,
    ChartComponent,
    MetricsCardComponent
  ],
  imports: [
    SharedModule,           // Shared UI components
    AnalyticsRoutingModule  // Feature routes
  ],
  providers: [
    AnalyticsService,       // Feature-specific services
    AnalyticsGuard
  ]
})
export class AnalyticsModule { }
```

**Isolation Rules:**
- Feature modules **cannot import other feature modules**
- Communication happens through Core services
- Shared state via StateService (Core)
- Navigation via Router

---

## Lazy Loading Strategy

### Why Lazy Load?

**Performance Benefits:**
- Initial bundle size: ~200KB → ~80KB
- Time to Interactive: Improved by 60%
- Feature isolation: Only load what user needs

### Implementation

**1. Route Configuration (app-routing.module.ts)**
```typescript
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/analytics/analytics.module')
      .then(m => m.AnalyticsModule)
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module')
      .then(m => m.UsersModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.module')
      .then(m => m.SettingsModule)
  }
];
```

**2. Feature Routing (analytics-routing.module.ts)**
```typescript
const routes: Routes = [
  {
    path: '',
    component: AnalyticsDashboardComponent
  },
  {
    path: 'reports',
    component: ReportsComponent
  }
];
```

**3. Preloading Strategy (Optional)**
```typescript
// Preload after initial load
RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules
})
```

### Bundle Analysis

**Without Lazy Loading:**
```
main.js: 450KB
vendor.js: 800KB
Total: 1.25MB
```

**With Lazy Loading:**
```
main.js: 80KB
vendor.js: 800KB (shared)
analytics.js: 120KB (loaded on demand)
users.js: 95KB (loaded on demand)
settings.js: 75KB (loaded on demand)
```

---

## Module Federation

### What is Module Federation?

**Module Federation** allows independently deployed applications to share code at runtime. It enables:
- **Micro-frontend architecture**
- **Independent deployments**
- **Zero-downtime updates**
- **Shared dependencies**

### Architecture

```
┌─────────────────┐
│   Host Shell    │  ← Main application (always loaded)
│  (Port 4200)    │
└────────┬────────┘
         │
         │ Dynamically loads remotes:
         │
    ┌────┴─────┬──────────┬──────────┐
    │          │          │          │
┌───▼────┐ ┌──▼─────┐ ┌──▼─────┐ ┌──▼─────┐
│Analytics│ │ Users  │ │Settings│ │ Remote │
│ Module  │ │ Module │ │ Module │ │ Feature│
└─────────┘ └────────┘ └────────┘ └────────┘
                                   (Port 4201)
```

### Configuration

**Host Application (webpack.config.js):**
```javascript
module.exports = {
  output: {
    uniqueName: "host",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      remotes: {
        'remote-app': 'remoteApp@http://localhost:4201/remoteEntry.js'
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true },
        "@angular/common": { singleton: true, strictVersion: true },
        "@angular/router": { singleton: true, strictVersion: true },
        "rxjs": { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

**Remote Application (webpack.config.js):**
```javascript
module.exports = {
  output: {
    uniqueName: "remoteApp",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "remoteApp",
      filename: "remoteEntry.js",
      exposes: {
        './RemoteModule': './src/app/remote/remote.module.ts'
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true },
        "@angular/common": { singleton: true, strictVersion: true },
        "rxjs": { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

**Loading Remote Module:**
```typescript
{
  path: 'remote-feature',
  loadChildren: () => loadRemoteModule({
    remoteEntry: 'http://localhost:4201/remoteEntry.js',
    remoteName: 'remoteApp',
    exposedModule: './RemoteModule'
  }).then(m => m.RemoteModule)
}
```

### Shared Dependencies

**Critical for Module Federation:**
- **Singleton:** Ensures one instance of Angular core
- **StrictVersion:** Prevents version conflicts
- **EagerShare:** Loads immediately for compatibility

**Example Scenario:**
```
Host App: @angular/core@16.2.0
Remote App: @angular/core@16.2.5

Result: Shared singleton at 16.2.0 (host version)
```

---

## Module Communication

### Pattern 1: Shared State Service

**Core Layer Service:**
```typescript
@Injectable({ providedIn: 'root' })
export class StateService {
  private selectedUserSubject = new BehaviorSubject<User | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  setSelectedUser(user: User): void {
    this.selectedUserSubject.next(user);
  }
}
```

**Usage in Feature A:**
```typescript
// Users module - set state
this.stateService.setSelectedUser(user);
this.router.navigate(['/analytics']);
```

**Usage in Feature B:**
```typescript
// Analytics module - read state
this.stateService.selectedUser$.subscribe(user => {
  this.loadUserAnalytics(user.id);
});
```

### Pattern 2: Event Bus

**Core Layer Service:**
```typescript
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventSubject = new Subject<AppEvent>();
  events$ = this.eventSubject.asObservable();

  emit(event: AppEvent): void {
    this.eventSubject.next(event);
  }
}
```

### Pattern 3: Router Communication

```typescript
// Navigate with data
this.router.navigate(['/users/detail'], {
  queryParams: { id: user.id },
  state: { user: user }
});

// Read data
this.route.queryParams.subscribe(params => {
  const userId = params['id'];
});
```

---

## Isolation & Encapsulation

### What Can Features Share?

✅ **Allowed:**
- Core services (singleton)
- Shared UI components
- Router navigation
- HTTP client (via Core)

❌ **Prohibited:**
- Direct feature-to-feature imports
- Accessing another feature's components
- Shared mutable state
- Global variables

### Enforcing Boundaries

**1. TypeScript Path Aliases:**
```json
{
  "paths": {
    "@core/*": ["src/app/core/*"],
    "@shared/*": ["src/app/shared/*"],
    "@features/*": ["src/app/features/*"]
  }
}
```

**2. ESLint Rules:**
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        "../features/*"  // Features cannot import other features
      ]
    }]
  }
}
```

**3. Dependency Cruiser:**
```javascript
module.exports = {
  forbidden: [
    {
      from: { path: "^src/app/features/[^/]+" },
      to: { path: "^src/app/features/(?!\\1)[^/]+" }
    }
  ]
};
```

---

## Scaling Strategy

### Adding New Features

**Steps:**
1. Create feature directory in `/features`
2. Generate module: `ng g module features/new-feature --routing`
3. Add lazy route in app routing
4. Implement feature components
5. Add navigation link in shell

**No changes required:**
- Core module
- Shared module
- Other features
- Build configuration

### Sub-Modules (Vertical Scaling)

When a feature grows large:

```
/features/users
  /user-list
    user-list.module.ts
  /user-detail
    user-detail.module.ts
  /user-permissions
    user-permissions.module.ts
  users.module.ts  ← Parent module
```

Parent module lazy loads sub-modules.

### Micro-Frontend Extraction

When ready to deploy independently:
1. Configure Module Federation
2. Extract feature to separate repo
3. Deploy as remote
4. Update host routing
5. **Zero code changes in feature**

---

## Performance Considerations

### Bundle Size Monitoring

```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

**Target Metrics:**
- Initial load: < 200KB
- Per-feature: < 150KB
- Shared chunk: < 50KB

### Lazy Loading Best Practices

1. **Group small features** - Avoid 10KB lazy modules
2. **Preload critical paths** - Dashboard, commonly used features
3. **Defer heavy dependencies** - Chart libraries only in analytics module

---

## Summary

This modularization strategy provides:
- **Clear boundaries** via Core/Shared/Features layers
- **Performance optimization** via lazy loading
- **Team scalability** via feature isolation
- **Deployment flexibility** via Module Federation
- **Long-term maintainability** via enforced dependencies

**The payoff:** Teams can work independently, deploy frequently, and scale confidently.
