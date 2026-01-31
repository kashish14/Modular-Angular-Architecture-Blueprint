# Module Federation Setup Guide

## Overview

**Module Federation** enables independent deployment of feature modules as separate applications that can be loaded dynamically at runtime. This guide explains how to implement Module Federation in this architecture.

## Why Module Federation?

### Benefits

1. **Independent Deployments** - Deploy features without redeploying the entire application
2. **Team Autonomy** - Teams own and deploy their features independently
3. **Reduced Build Times** - Build only what changed
4. **Runtime Composition** - Load modules on-demand
5. **Shared Dependencies** - Single instance of Angular, RxJS, etc.

### Use Cases

- **Large Teams** - Multiple teams working on different features
- **Micro-Frontends** - Independently deployable frontend applications
- **Gradual Migration** - Migrate legacy apps incrementally
- **A/B Testing** - Deploy different versions of features

---

## Architecture

```
┌─────────────────────────────────────┐
│          Host Application            │
│         (Shell - Port 4200)          │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Core Module                 │   │
│  │  (Always Loaded)             │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Layout Module               │   │
│  │  (Header, Sidebar, Shell)    │   │
│  └──────────────────────────────┘   │
│                                      │
│  Router Outlet → Loads Remotes       │
└─────────────────────────────────────┘
              ↓
    ┌─────────┴─────────────────┐
    │                           │
┌───▼────┐  ┌────▼────┐  ┌─────▼───┐
│Analytics│  │ Users   │  │Settings │
│ Remote  │  │ Remote  │  │ Remote  │
│Port 4201│  │Port 4202│  │Port 4203│
└─────────┘  └─────────┘  └─────────┘
```

---

## Implementation Steps

### Step 1: Install Module Federation Plugin

```bash
npm install @angular-architects/module-federation --save-dev
ng add @angular-architects/module-federation --project enterprise-admin-workspace --port 4200 --type host
```

### Step 2: Configure Host Application

**webpack.config.js** (Host)

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');
const path = require('path');

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  ['@core', '@shared']
);

module.exports = {
  output: {
    uniqueName: 'host',
    publicPath: 'auto'
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases()
    }
  },
  plugins: [
    new ModuleFederationPlugin({
      remotes: {
        'analytics': 'analytics@http://localhost:4201/remoteEntry.js',
        'users': 'users@http://localhost:4202/remoteEntry.js',
        'settings': 'settings@http://localhost:4203/remoteEntry.js'
      },
      shared: {
        '@angular/core': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        },
        '@angular/common': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        },
        '@angular/router': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        },
        'rxjs': {
          singleton: true,
          strictVersion: true,
          requiredVersion: 'auto'
        },
        ...sharedMappings.getDescriptors()
      }
    }),
    sharedMappings.getPlugin()
  ]
};
```

### Step 3: Create Remote Applications

**Create Analytics Remote:**

```bash
ng generate application analytics-remote --routing --style=scss
ng add @angular-architects/module-federation --project analytics-remote --port 4201 --type remote
```

**webpack.config.js** (Analytics Remote)

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const mf = require('@angular-architects/module-federation/webpack');

module.exports = {
  output: {
    uniqueName: 'analytics',
    publicPath: 'auto'
  },
  optimization: {
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'analytics',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './src/app/features/analytics/analytics.module.ts'
      },
      shared: {
        '@angular/core': { singleton: true, strictVersion: true },
        '@angular/common': { singleton: true, strictVersion: true },
        '@angular/router': { singleton: true, strictVersion: true },
        'rxjs': { singleton: true, strictVersion: true }
      }
    })
  ]
};
```

### Step 4: Update Host Routing

**app-routing.module.ts** (Host)

```typescript
import { loadRemoteModule } from '@angular-architects/module-federation';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4201/remoteEntry.js',
      exposedModule: './Module'
    }).then(m => m.AnalyticsModule)
  },
  {
    path: 'users',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4202/remoteEntry.js',
      exposedModule: './Module'
    }).then(m => m.UsersModule)
  },
  {
    path: 'settings',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: 'http://localhost:4203/remoteEntry.js',
      exposedModule: './Module'
    }).then(m => m.SettingsModule)
  }
];
```

---

## Running Module Federation

### Development Mode

**Terminal 1 - Host:**
```bash
ng serve --port 4200
```

**Terminal 2 - Analytics Remote:**
```bash
ng serve analytics-remote --port 4201
```

**Terminal 3 - Users Remote:**
```bash
ng serve users-remote --port 4202
```

**Terminal 4 - Settings Remote:**
```bash
ng serve settings-remote --port 4203
```

### Production Build

```bash
# Build all remotes
ng build analytics-remote --prod
ng build users-remote --prod
ng build settings-remote --prod

# Build host
ng build --prod
```

---

## Shared Dependencies

### Critical Configuration

**Why Singleton is Important:**

```javascript
{
  '@angular/core': {
    singleton: true,        // Only one instance
    strictVersion: true,    // Must match version
    requiredVersion: 'auto' // Use package.json version
  }
}
```

Without `singleton: true`, you get:
- Multiple Angular instances (breaks change detection)
- Duplicate dependency loading
- Runtime errors

---

## Version Management

### Handling Version Conflicts

**Scenario:**
- Host: `@angular/core@16.2.0`
- Remote: `@angular/core@16.2.5`

**With `strictVersion: true`:**
- ❌ Fails to load (version mismatch)

**With `strictVersion: false`:**
- ✅ Uses host version (16.2.0)

**Best Practice:**
- Keep versions aligned across host/remotes
- Use `strictVersion: true` in development
- Consider `strictVersion: false` for production flexibility

---

## Dynamic Remote Configuration

### Load Remotes from Config

**remote-config.json:**

```json
{
  "remotes": {
    "analytics": "https://analytics.example.com/remoteEntry.js",
    "users": "https://users.example.com/remoteEntry.js",
    "settings": "https://settings.example.com/remoteEntry.js"
  }
}
```

**Load dynamically:**

```typescript
@Injectable({ providedIn: 'root' })
export class FederationService {
  private config: any;

  async loadConfig(): Promise<void> {
    const response = await fetch('/assets/remote-config.json');
    this.config = await response.json();
  }

  loadRemoteModule(remoteName: string, exposedModule: string) {
    const remoteEntry = this.config.remotes[remoteName];
    
    return loadRemoteModule({
      type: 'module',
      remoteEntry,
      exposedModule
    });
  }
}
```

---

## Error Handling

### Graceful Fallbacks

```typescript
{
  path: 'dashboard',
  loadChildren: () => loadRemoteModule({
    type: 'module',
    remoteEntry: 'http://localhost:4201/remoteEntry.js',
    exposedModule: './Module'
  })
  .then(m => m.AnalyticsModule)
  .catch(err => {
    console.error('Failed to load analytics module', err);
    // Fallback to local module
    return import('./features/analytics/analytics.module')
      .then(m => m.AnalyticsModule);
  })
}
```

---

## Deployment Strategies

### Strategy 1: Independent Deployment

```
1. Deploy remotes first
   - analytics.example.com/remoteEntry.js
   - users.example.com/remoteEntry.js

2. Deploy host last
   - app.example.com
```

**Benefit:** Update features without redeploying host

### Strategy 2: Canary Deployment

```json
{
  "remotes": {
    "analytics": "https://analytics-canary.example.com/remoteEntry.js",
    "analytics-stable": "https://analytics.example.com/remoteEntry.js"
  }
}
```

Route 10% of users to canary, 90% to stable.

---

## Performance Considerations

### Initial Load Time

**Without Module Federation:**
```
main.js: 800KB (all features)
```

**With Module Federation:**
```
main.js: 200KB (host + core)
analytics.js: 150KB (loaded on demand)
users.js: 120KB (loaded on demand)
settings.js: 100KB (loaded on demand)
```

**Time to Interactive:**
- Without MF: 4.5s
- With MF: 1.8s (60% faster)

### Caching Strategy

```nginx
# nginx.conf
location /remoteEntry.js {
  expires 5m;  # Short cache for remote entry
}

location ~ \.chunk\.js$ {
  expires 1y;  # Long cache for chunks
}
```

---

## Debugging

### Common Issues

**1. Module not found:**
```
Error: Cannot find module './Module'
```
**Fix:** Check `exposes` config in remote webpack.config.js

**2. Version mismatch:**
```
Error: Shared module is not available for eager consumption
```
**Fix:** Ensure versions match and `singleton: true`

**3. CORS errors:**
```
Access to fetch blocked by CORS policy
```
**Fix:** Configure CORS headers on remote server

---

## Summary

Module Federation enables:

1. **Independent Deployments** - Features deployed separately
2. **Smaller Bundles** - Load only what's needed
3. **Team Autonomy** - Teams own their remotes
4. **Runtime Composition** - Dynamic loading
5. **Shared Dependencies** - No duplication

**When to use:**
- Large applications (10+ features)
- Multiple teams
- Micro-frontend architecture
- Independent feature releases

**When NOT to use:**
- Small applications (< 5 features)
- Single team
- Monolithic deployment preferred
