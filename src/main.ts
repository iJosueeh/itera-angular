import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// ponytail: AOS scroll animations — initialized once after app bootstrap
import AOS from 'aos';

bootstrapApplication(App, appConfig)
  .then(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: true,
      offset: 80,
    });
  })
  .catch((err) => console.error(err));
