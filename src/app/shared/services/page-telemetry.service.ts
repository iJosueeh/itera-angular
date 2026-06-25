import { inject, Injectable, NgZone } from '@angular/core';
import { MarketApiService } from '@features/home/services/market-api.service';
import { AuthStorageService } from './auth-storage.service';

@Injectable({ providedIn: 'root' })
export class PageTelemetryService {
  private readonly marketApi = inject(MarketApiService);
  private readonly authStorage = inject(AuthStorageService);
  private readonly ngZone = inject(NgZone);

  private pageEntryTime = 0;
  private currentPage = '';
  private scrollDepth = 0;
  private maxScrollDepth = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  startTracking(pageName: string): void {
    this.stopTracking();

    this.currentPage = pageName;
    this.pageEntryTime = Date.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;

    // Track scroll depth
    const scrollHandler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      this.scrollDepth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Periodic interaction tracking (every 30s)
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.sendEvent('periodic_heartbeat');
      }, 30000);
    });

    // Store cleanup
    (this as any)._scrollHandler = scrollHandler;
  }

  stopTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if ((this as any)._scrollHandler) {
      window.removeEventListener('scroll', (this as any)._scrollHandler);
      (this as any)._scrollHandler = null;
    }

    // Send final page view event with timing
    if (this.currentPage && this.pageEntryTime > 0) {
      this.sendEvent('page_view');
    }
  }

  trackInteraction(action: string, context: Record<string, any> = {}): void {
    this.marketApi
      .sendTelemetry({
        estudiante_id: this.authStorage.getUserId() || 'guest',
        accion: action,
        datos_contexto: {
          page: this.currentPage,
          ...context,
        },
        tiempo_permanencia_segundos: Math.round(
          (Date.now() - this.pageEntryTime) / 1000
        ),
      })
      .subscribe({ error: () => {} });
  }

  private sendEvent(action: string): void {
    const timeOnPage = Math.round((Date.now() - this.pageEntryTime) / 1000);

    this.marketApi
      .sendTelemetry({
        estudiante_id: this.authStorage.getUserId() || 'guest',
        accion: action,
        datos_contexto: {
          page: this.currentPage,
          scroll_depth: this.maxScrollDepth,
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
        },
        tiempo_permanencia_segundos: timeOnPage,
      })
      .subscribe({ error: () => {} });
  }
}
