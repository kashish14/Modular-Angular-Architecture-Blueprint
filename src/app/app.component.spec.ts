import { TestBed } from '@angular/core/testing';
import { RouterModule, provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { LayoutModule } from './layout/layout.module';
import { StateService } from './core/services/state.service';

describe('AppComponent', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [LayoutModule, RouterModule],
      declarations: [AppComponent],
      providers: [provideRouter([])]
    })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it(`should have the title 'Enterprise Admin Workspace'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.title).toEqual('Enterprise Admin Workspace');
  });

  it('should render the shell with header title and navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-title')?.textContent).toContain('Enterprise Admin Workspace');
    expect(compiled.querySelectorAll('.nav-item').length).toBe(3);
  });

  it('should toggle the sidebar through StateService', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const state = TestBed.inject(StateService);
    state.setSidebarCollapsed(false);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.menu-toggle')!.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.sidebar')?.classList).toContain('collapsed');
  });
});
