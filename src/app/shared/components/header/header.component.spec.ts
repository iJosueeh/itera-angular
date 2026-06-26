import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the brand name', () => {
    fixture.componentRef.setInput('brand', 'Custom Brand');
    fixture.detectChanges();

    const brandElement = fixture.debugElement.query(
      By.css('a[aria-label="Ir al inicio"]'),
    ).nativeElement;
    expect(brandElement.textContent).toContain('Custom Brand');
  });
  it('should render navigation items', () => {
    const mockItems = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ];
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();

    const navLinks = fixture.debugElement.queryAll(By.css('nav a'));
    expect(navLinks.length).toBe(mockItems.length);
    expect(navLinks[0].nativeElement.textContent.trim()).toBe('Home');
    expect(navLinks[1].nativeElement.textContent.trim()).toBe('About');
  });

  it('should hide user actions when showUserActions is false', () => {
    fixture.componentRef.setInput('showUserActions', false);
    fixture.detectChanges();

    const userActions = fixture.debugElement.query(By.css('.flex.items-center.gap-3'));
    // Since login/register links are usually in a container, let's check for them specifically
    const loginLink = fixture.debugElement.query(By.css('a[href="/auth/login"]'));
    expect(loginLink).toBeNull();
  });
});
