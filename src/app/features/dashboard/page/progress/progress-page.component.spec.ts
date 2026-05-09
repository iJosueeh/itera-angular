import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressPageComponent } from './progress-page.component';
import { By } from '@angular/platform-browser';
import { DashboardContentService } from '../../../home/services/dashboard-content.service';
import { provideRouter } from '@angular/router';

describe('ProgressPageComponent', () => {
  let component: ProgressPageComponent;
  let fixture: ComponentFixture<ProgressPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressPageComponent],
      providers: [DashboardContentService, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 4 mastery cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('article.text-center'));
    expect(cards.length).toBe(4);

    const titles = cards.map((c) =>
      c.query(By.css('p.font-semibold')).nativeElement.textContent.trim(),
    );
    expect(titles).toContain('Python Basics');
    expect(titles).toContain('Pandas & NumPy');
    expect(titles).toContain('Visualisation');
    expect(titles).toContain('Deep Learning');
  });

  it('should render the Mentor Alert card in the sidebar', () => {
    const sidebar = fixture.debugElement.query(By.css('aside.flex-col'));
    expect(sidebar).toBeTruthy();

    const mentorAlert = sidebar.query(By.css('article.bg-\\[\\#4f54c4\\]'));
    expect(mentorAlert).toBeTruthy();

    const title = mentorAlert.query(By.css('h2')).nativeElement.textContent.trim();
    expect(title).toBe('Retoma tu ruta en Python');

    const button = mentorAlert.query(By.css('button'));
    expect(button.nativeElement.textContent).toContain('Continue Learning');
    expect(button.nativeElement.classList).toContain('w-full');
  });

  it('should display the correct current streak', () => {
    const streakContainer = fixture.debugElement.query(
      By.css('.rounded-\\[24px\\].border-\\[\\#dff4e9\\]'),
    );
    expect(streakContainer).toBeTruthy();

    const streakText = streakContainer.query(By.css('.text-2xl')).nativeElement.textContent.trim();
    expect(streakText).toContain('14 Days');
  });

  it('should have the correct grid layout for the main section', () => {
    const section = fixture.debugElement.query(By.css('section.grid'));
    expect(section.nativeElement.classList).toContain('xl:grid-cols-[minmax(0,1fr)_380px]');
  });

  it('should align "View all +" to the right of Module Mastery', () => {
    const masterySection = fixture.debugElement.query(By.css('.mt-8.rounded-\\[24px\\]'));
    const masteryHeader = masterySection.query(By.css('.flex.items-center.justify-between'));
    expect(masteryHeader).toBeTruthy();

    const viewAllLink = masteryHeader.query(By.css('a[href="#badges"]'));
    expect(viewAllLink.nativeElement.textContent.trim()).toBe('View all +');
  });
});
