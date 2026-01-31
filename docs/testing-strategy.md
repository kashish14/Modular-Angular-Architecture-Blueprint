# Testing Strategy

## Overview

This document outlines the **testing strategy** for the modular Angular application, including unit testing, integration testing, and architectural boundary testing.

## Testing Philosophy

Our testing strategy follows these principles:

1. **Test Behavior, Not Implementation** - Focus on what components/services do, not how they do it
2. **Test in Isolation** - Mock dependencies to test components independently
3. **Test at the Right Level** - Unit tests for logic, integration tests for workflows
4. **Enforce Architecture** - Test that dependency rules are followed

---

## Unit Testing

### Core Services

**What to Test:**
- Service methods return expected values
- State is managed correctly
- Side effects occur as expected (localStorage, events)
- Error handling works properly

**Example: AuthService**

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('should authenticate user on login', (done) => {
    service.login(credentials).subscribe(response => {
      expect(response.user).toBeDefined();
      expect(service.isAuthenticated).toBeTruthy();
      done();
    });
  });
});
```

### Shared Components

**What to Test:**
- Components render correctly with different inputs
- Events are emitted properly
- Component state changes as expected
- Styling/classes applied correctly

**Example: ButtonComponent**

```typescript
describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
  });

  it('should emit click event when clicked', () => {
    spyOn(component.clicked, 'emit');
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should not emit click when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    
    spyOn(component.clicked, 'emit');
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(component.clicked.emit).not.toHaveBeenCalled();
  });
});
```

### Feature Components

**What to Test:**
- Component loads data on initialization
- User interactions trigger correct service calls
- State updates reflect in UI
- Navigation occurs as expected

**Example: AnalyticsDashboardComponent**

```typescript
describe('AnalyticsDashboardComponent', () => {
  let component: AnalyticsDashboardComponent;
  let analyticsService: jasmine.SpyObj<AnalyticsService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AnalyticsService', ['getAnalyticsData']);

    TestBed.configureTestingModule({
      declarations: [AnalyticsDashboardComponent],
      providers: [{ provide: AnalyticsService, useValue: spy }]
    });

    analyticsService = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
  });

  it('should load analytics on init', () => {
    analyticsService.getAnalyticsData.and.returnValue(of(mockData));
    
    component.ngOnInit();

    expect(analyticsService.getAnalyticsData).toHaveBeenCalled();
    expect(component.loading).toBeFalsy();
  });
});
```

---

## Integration Testing

### Feature Module Integration

Test entire feature workflows, including:
- Component → Service → HTTP interaction
- Multi-step user flows
- Cross-component communication

**Example: User Selection Flow**

```typescript
describe('User Selection Integration', () => {
  it('should select user and update shared state', () => {
    const stateService = TestBed.inject(StateService);
    const usersService = TestBed.inject(UsersService);
    
    const mockUser = { id: '1', name: 'Test User' };
    
    usersService.selectUser(mockUser);
    
    stateService.selectedUserId$.subscribe(id => {
      expect(id).toBe('1');
    });
  });
});
```

### Module Communication

Test that modules communicate correctly through Core services:

```typescript
describe('Cross-Module Communication', () => {
  it('should emit event when user selected', () => {
    const eventBus = TestBed.inject(EventBusService);
    const usersService = TestBed.inject(UsersService);
    
    let receivedEvent: AppEvent | null = null;
    
    eventBus.on('USER_SELECTED').subscribe(event => {
      receivedEvent = event;
    });
    
    usersService.selectUser(mockUser);
    
    expect(receivedEvent).toBeDefined();
    expect(receivedEvent?.payload.id).toBe(mockUser.id);
  });
});
```

---

## Architectural Testing

### Dependency Rule Enforcement

**Test that architecture rules are followed:**

```typescript
describe('Architecture Rules', () => {
  it('should not have circular dependencies', () => {
    // Use madge or similar tool
    const analysis = analyzeDependencies('src/app');
    expect(analysis.circular).toEqual([]);
  });

  it('core should not depend on features', () => {
    const coreFiles = glob.sync('src/app/core/**/*.ts');
    
    coreFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const hasFeatureImport = /from ['"].*\/features\//.test(content);
      
      expect(hasFeatureImport).toBeFalsy();
    });
  });

  it('features should not import other features', () => {
    const featureFiles = glob.sync('src/app/features/**/*.ts');
    
    featureFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const currentFeature = file.match(/features\/([^\/]+)\//)?.[1];
      
      if (currentFeature) {
        const importOtherFeature = new RegExp(
          `from ['"].*\/features\/(?!${currentFeature})`,
          'g'
        );
        
        expect(importOtherFeature.test(content)).toBeFalsy();
      }
    });
  });
});
```

---

## Test Coverage

### Coverage Targets

| Layer          | Target | Current |
|----------------|--------|---------|
| Core Services  | 90%    | -       |
| Shared         | 80%    | -       |
| Features       | 70%    | -       |
| Overall        | 75%    | -       |

### Running Coverage

```bash
# Generate coverage report
ng test --code-coverage

# View report
open coverage/index.html
```

---

## Testing Tools

### Jasmine

- Test framework
- Spec syntax (describe, it, expect)
- Spies and mocks

### Karma

- Test runner
- Runs tests in real browsers
- Watch mode for development

### TestBed

- Angular testing utility
- Creates testing modules
- Injects dependencies

---

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('should do something', () => {
  // Arrange
  const input = 'test';
  
  // Act
  const result = component.doSomething(input);
  
  // Assert
  expect(result).toBe('expected');
});
```

### 2. Mock External Dependencies

```typescript
const mockApiService = {
  get: jasmine.createSpy('get').and.returnValue(of(mockData))
};

TestBed.configureTestingModule({
  providers: [
    { provide: ApiService, useValue: mockApiService }
  ]
});
```

### 3. Test Observable Streams

```typescript
it('should emit values over time', fakeAsync(() => {
  let value: string | null = null;
  
  service.value$.subscribe(v => value = v);
  
  service.updateValue('test');
  tick();
  
  expect(value).toBe('test');
}));
```

### 4. Test Async Operations

```typescript
it('should handle async data', async () => {
  const result = await component.loadData().toPromise();
  expect(result).toBeDefined();
});
```

---

## Continuous Integration

### Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test -- --watch=false --browsers=ChromeHeadless
      - name: Check coverage
        run: npm test -- --code-coverage --watch=false
```

---

## Testing Checklist

Before merging code, ensure:

- [ ] New features have unit tests
- [ ] Services are tested in isolation
- [ ] Components test user interactions
- [ ] Integration tests cover workflows
- [ ] Architecture rules are validated
- [ ] Coverage meets targets
- [ ] All tests pass in CI

---

## Summary

A comprehensive testing strategy ensures:

1. **Code Quality** - Catch bugs early
2. **Refactoring Confidence** - Change code safely
3. **Documentation** - Tests explain behavior
4. **Architecture Enforcement** - Maintain boundaries
5. **Collaboration** - Shared understanding of expected behavior

**Remember:** Good tests are fast, isolated, repeatable, and meaningful.
