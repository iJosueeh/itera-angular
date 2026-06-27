import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressPageComponent } from './progress-page.component';
import { By } from '@angular/platform-browser';
import { DashboardContentService } from '../../../home/services/dashboard-content.service';
import { ProfileContentService } from '../../../profile/services/profile-content.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ProgressPageComponent', () => {
  let component: ProgressPageComponent;
  let fixture: ComponentFixture<ProgressPageComponent>;

  beforeEach(async () => {
    // Create a mock ProfileContentService that returns a profile with skills
    const mockProfileService = {
      isLoading: signal(false),
      error: signal<string | null>(null),
      currentTheme: signal('dim'),
      profile: signal({
        id: '1',
        userId: 'user-1',
        names: 'Test',
        surnames: 'User',
        cycle: 3,
        academicGoal: 'Backend',
        experience: 2,
        skills: [
          { name: 'Fundamentos de Python', level: 'advanced' },
          { name: 'Pandas & NumPy', level: 'intermediate' },
          { name: 'Visualización de Datos', level: 'beginner' },
          { name: 'Deep Learning', level: 'beginner' },
        ],
        badges: [],
        roadmap: [],
      }),
      loadProfile: () => {},
      updateAcademicGoal: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [ProgressPageComponent],
      providers: [
        DashboardContentService,
        { provide: ProfileContentService, useValue: mockProfileService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 4 mastery cards from profile skills', () => {
    const cards = fixture.debugElement.queryAll(By.css('itera-mastery-card'));
    expect(cards.length).toBe(4);

    const titles = cards.map((c) =>
      c.query(By.css('p.font-semibold')).nativeElement.textContent.trim(),
    );
    expect(titles).toContain('Fundamentos de Python');
    expect(titles).toContain('Pandas & NumPy');
    expect(titles).toContain('Visualización de Datos');
    expect(titles).toContain('Deep Learning');
  });

  it('should render the Mentor Alert card in the sidebar', () => {
    const sidebar = fixture.debugElement.query(By.css('aside.flex-col'));
    expect(sidebar).toBeTruthy();

    const mentorAlert = sidebar.query(By.css('itera-mentor-alert-card'));
    expect(mentorAlert).toBeTruthy();

    const title = mentorAlert.query(By.css('h2')).nativeElement.textContent.trim();
    // User has skills (4) but no learning progress → mentor says "Mantén el ritmo"
    expect(['Mantén el ritmo', 'Expande tu arsenal', 'Enfócate en lo crítico']).toContain(title);

    const button = mentorAlert.query(By.css('button'));
    expect(button.nativeElement.textContent).toContain('Ver progreso');
  });

  it('should have the correct grid layout for the main section', () => {
    const section = fixture.debugElement.query(By.css('section.grid'));
    expect(section.nativeElement.classList).toContain('xl:grid-cols-[minmax(0,1fr)_380px]');
  });

  it('should render badges section with the correct header', () => {
    const badgesSection = fixture.debugElement.query(By.css('#badges'));
    expect(badgesSection).toBeTruthy();

    const badgesTitle = badgesSection.query(By.css('h2'));
    expect(badgesTitle.nativeElement.textContent.trim()).toBe('Galería de Insignias');
  });
});
