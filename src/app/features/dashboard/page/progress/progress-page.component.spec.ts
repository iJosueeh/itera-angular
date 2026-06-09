import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressPageComponent } from './progress-page.component';
import { By } from '@angular/platform-browser';
import { DashboardContentService } from '@features/home/services/dashboard-content.service';
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
    expect(title).toBe('Retoma tu ruta en Python');

    const button = mentorAlert.query(By.css('button'));
    expect(button.nativeElement.textContent).toContain('Continuar Aprendiendo');
  });

  it('should have the correct grid layout for the main section', () => {
    const section = fixture.debugElement.query(By.css('section.grid'));
    expect(section.nativeElement.classList).toContain('xl:grid-cols-[minmax(0,1fr)_380px]');
  });

  it('should align "Ver Todo +" to the right of Module Mastery', () => {
    const masterySection = fixture.debugElement.query(By.css('.mt-10.rounded-\\[2\\.5rem\\]'));
    const masteryHeader = masterySection.query(By.css('.flex.items-center.justify-between'));
    expect(masteryHeader).toBeTruthy();

    const viewAllLink = masteryHeader.query(By.css('a[href="#badges"]'));
    expect(viewAllLink.nativeElement.textContent.trim()).toBe('Ver Todo +');
  });
});
