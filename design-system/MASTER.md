# Itera Design System - Master Reference

> **Version**: 2.0 | **Last Updated**: 2026-06-25  
> **Status**: Active | **Theme**: Modern Green + Slate

---

## 1. Design Philosophy

**Approachable Technology** — Not corporate, not playful. Professional but warm.  
The design should feel like a knowledgeable friend helping you navigate your career, not a cold tech platform.

### Core Principles

1. **Data-First**: Show real information, not decorative elements
2. **Green as Primary**: The Itera green (#00a181) is the brand anchor
3. **Dark by Default**: Slate-based dark theme for modern tech feel
4. **Accessible**: WCAG 2.1 AA compliance, minimum 4.5:1 contrast
5. **Mobile-First**: Design for 375px, scale up

---

## 2. Color System

### Primary Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-primary` | Itera Green | `#00a181` | Primary actions, links, brand |
| `--color-primary-dark` | Deep Green | `#00826a` | Hover states, dark accents |
| `--color-primary-light` | Bright Green | `#00c49a` | Highlights, success states |

### Secondary Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-secondary` | Sky Blue | `#0ea5e9` | Trust, professionalism, secondary actions |
| `--color-secondary-dark` | Deep Sky | `#0284c7` | Hover states |
| `--color-secondary-light` | Light Sky | `#38bdf8` | Highlights |

### Accent Palette

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-accent` | Amber | `#f59e0b` | CTAs, alerts, important highlights |
| `--color-accent-dark` | Deep Amber | `#d97706` | Hover states |
| `--color-accent-light` | Light Amber | `#fbbf24` | Subtle highlights |

### Neutral Palette (Slate)

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-neutral-900` | Slate 900 | `#0f172a` | Main background |
| `--color-neutral-800` | Slate 800 | `#1e293b` | Card backgrounds |
| `--color-neutral-700` | Slate 700 | `#334155` | Borders, dividers |
| `--color-neutral-600` | Slate 600 | `#475569` | Muted text |
| `--color-neutral-500` | Slate 500 | `#64748b` | Secondary text |
| `--color-neutral-400` | Slate 400 | `#94a3b8` | Placeholder text |
| `--color-neutral-300` | Slate 300 | `#cbd5e1` | Light borders |
| `--color-neutral-200` | Slate 200 | `#e2e8f0` | Subtle backgrounds |
| `--color-neutral-100` | Slate 100 | `#f1f5f9` | Primary text |
| `--color-neutral-50` | Slate 50 | `#f8fafc` | White text |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#10b981` | Success states, positive values |
| `--color-warning` | `#f59e0b` | Warnings, caution |
| `--color-error` | `#ef4444` | Errors, destructive actions |
| `--color-info` | `#3b82f6` | Information, neutral highlights |

### Color Usage Rules

- **Never use raw hex** in components — always use semantic tokens
- **Primary** for main actions and brand elements
- **Secondary** for supporting elements and trust indicators
- **Accent** sparingly for CTAs and important highlights
- **Neutrals** for backgrounds, text, and borders
- **Semantic** for feedback states only

---

## 3. Typography

### Font Families

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display | Inter | 600, 700, 800 | Headlines, hero text |
| Body | Inter | 400, 500, 600 | Body text, UI elements |
| Mono | JetBrains Mono | 400, 500 | Data, metrics, code |

### Type Scale

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| `--text-xs` | 0.75rem (12px) | 1.5 | 500 | Captions, labels |
| `--text-sm` | 0.875rem (14px) | 1.5 | 500 | Secondary text |
| `--text-base` | 1rem (16px) | 1.6 | 400 | Body text |
| `--text-lg` | 1.125rem (18px) | 1.5 | 500 | Large body |
| `--text-xl` | 1.25rem (20px) | 1.4 | 600 | Card titles |
| `--text-2xl` | 1.5rem (24px) | 1.3 | 600 | Section titles |
| `--text-3xl` | 1.875rem (30px) | 1.2 | 700 | Page titles |
| `--text-4xl` | 2.25rem (36px) | 1.1 | 700 | Hero subtitles |
| `--text-5xl` | 3rem (48px) | 1.0 | 700 | Hero titles |
| `--text-6xl` | 3.75rem (60px) | 1.0 | 800 | Display titles |

### Typography Rules

- **Line length**: 60-75 characters max for body text
- **Line height**: 1.5-1.75 for body, 1.1-1.3 for headings
- **Letter spacing**: -0.02em for large headings, normal for body
- **Font weight**: 400 body, 500 labels, 600-700 headings, 800 display

---

## 4. Spacing System

### Base Unit: 8px

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tiny gaps |
| `--space-2` | 8px | Small gaps |
| `--space-3` | 12px | Medium gaps |
| `--space-4` | 16px | Standard gaps |
| `--space-5` | 20px | Large gaps |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Major gaps |
| `--space-10` | 40px | Large sections |
| `--space-12` | 48px | Section dividers |
| `--space-16` | 64px | Major sections |
| `--space-20` | 80px | Hero spacing |

### Spacing Rules

- **Component padding**: `--space-4` to `--space-6`
- **Section spacing**: `--space-12` to `--space-16`
- **Card padding**: `--space-6` to `--space-8`
- **Button padding**: `--space-3` to `--space-4`

---

## 5. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Small elements (badges) |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards |
| `--radius-2xl` | 24px | Feature cards, hero |
| `--radius-full` | 9999px | Pills, avatars |

### Radius Rules

- **Consistency**: Use same radius within same hierarchy level
- **Cards**: `--radius-xl` or `--radius-2xl`
- **Buttons**: `--radius-md` or `--radius-lg`
- **Inputs**: `--radius-md`
- **Avatars**: `--radius-full`

---

## 6. Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Cards |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Elevated cards |
| `--shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Modals, dropdowns |
| `--shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Hero elements |

### Shadow Rules

- **Cards**: `--shadow-md` to `--shadow-lg`
- **Modals**: `--shadow-xl` to `--shadow-2xl`
- **Buttons**: `--shadow-sm` to `--shadow-md`
- **Hover states**: Increase shadow depth

---

## 7. Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 150ms | Micro-interactions |
| `--transition-base` | 200ms | Standard transitions |
| `--transition-slow` | 300ms | Complex animations |

### Easing

- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)`
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)`

### Animation Rules

- **Duration**: 150-300ms for micro-interactions
- **Transform only**: Never animate width/height/top/left
- **Reduced motion**: Respect `prefers-reduced-motion`
- **One hero animation**: Don't over-animate

---

## 8. Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default |
| `--z-dropdown` | 10 | Dropdowns, tooltips |
| `--z-sticky` | 20 | Sticky headers |
| `--z-overlay` | 30 | Overlays, backdrops |
| `--z-modal` | 40 | Modals, dialogs |
| `--z-toast` | 50 | Toasts, notifications |

### Z-Index Rules

- **Never use arbitrary values** — always use tokens
- **Stacking**: Ensure logical z-index hierarchy
- **Context**: Use `position: relative` when z-index is needed

---

## 9. Component Patterns

### Glass Card

```html
<div class="glass-card p-6">
  <!-- Content -->
</div>
```

**CSS**:
```css
.glass-card {
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-2xl);
}
```

### Skeleton Loader

```html
<div class="skeleton h-4 w-3/4"></div>
<div class="skeleton h-4 w-1/2 mt-2"></div>
```

**CSS**:
```css
.skeleton {
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}
```

### Primary Button

```html
<button class="btn-primary-custom">
  Action
</button>
```

**CSS**:
```css
.btn-primary-custom {
  background: linear-gradient(135deg, #00a181 0%, #00826a 100%);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 14px rgba(0, 161, 129, 0.3);
  transition: all var(--transition-base);
}
```

---

## 10. Accessibility

### Contrast Requirements

- **Normal text**: 4.5:1 minimum (WCAG AA)
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Accessibility Checklist

- [ ] All images have alt text
- [ ] All buttons have accessible labels
- [ ] Form inputs have labels
- [ ] Color is not the only indicator
- [ ] Keyboard navigation works
- [ ] Screen reader testing passed
- [ ] Focus states visible
- [ ] Reduced motion respected

---

## 11. Responsive Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| Mobile | 0px | Default, single column |
| Tablet | 768px | Two columns, larger text |
| Desktop | 1024px | Full layout, sidebar |
| Wide | 1280px | Max-width container |

### Container Widths

| Breakpoint | Max Width |
|------------|-----------|
| Mobile | 100% |
| Tablet | 720px |
| Desktop | 1024px |
| Wide | 1200px |

---

## 12. File Locations

| File | Path |
|------|------|
| Main Styles | `src/styles.css` |
| Theme Config | `src/styles.css` (DaisyUI plugin) |
| Design Tokens | `src/styles.css` (@theme) |
| Components | `src/app/shared/components/` |
| Feature Pages | `src/app/features/` |

---

## 13. Naming Conventions

### CSS Classes

- **Component**: `itera-` prefix (e.g., `itera-card`)
- **Utility**: Tailwind utilities (e.g., `text-primary`, `bg-neutral-800`)
- **Custom**: kebab-case (e.g., `glass-card`, `btn-primary-custom`)

### Design Tokens

- **CSS Variables**: `--` prefix, kebab-case (e.g., `--color-primary`)
- **Tailwind**: `@theme` directive, kebab-case (e.g., `--color-primary`)

---

## 14. Anti-Patterns to Avoid

1. **Don't use raw hex values** in components
2. **Don't mix color systems** (old + new)
3. **Don't use arbitrary z-index values**
4. **Don't animate layout properties** (width, height, top, left)
5. **Don't skip focus states** for accessibility
6. **Don't use emoji as icons** — use Bootstrap Icons
7. **Don't hardcode font families** — use tokens
8. **Don't ignore reduced motion**

---

## 15. Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-06-25 | Complete redesign: Green + Slate palette, Inter font, modern tokens |
| 1.0 | Original | Indigo + Purple palette, Sora + Nunito Sans |

---

**Maintainer**: AI Assistant  
**Review Cycle**: Monthly  
**Next Review**: 2026-07-25
