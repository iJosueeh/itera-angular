import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the brand name', () => {
    fixture.componentRef.setInput('brand', 'Footer Brand');
    fixture.detectChanges();

    const brandElement = fixture.debugElement.query(By.css('p.font-black')).nativeElement;
    expect(brandElement.textContent).toContain('Footer Brand');
  });
  it('should render footer links', () => {
    const mockLinks = [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ];
    fixture.componentRef.setInput('links', mockLinks);
    fixture.detectChanges();

    const links = fixture.debugElement.queryAll(By.css('a'));
    // Filter out potential social links if they exist, or just check if our links are there
    const linkTexts = links.map((l) => l.nativeElement.textContent.trim());
    expect(linkTexts).toContain('Privacy');
    expect(linkTexts).toContain('Terms');
  });
});
