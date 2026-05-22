import { Component } from '@angular/core';
import { APP_CONFIG } from '../../../core/config/config';

@Component({
  selector: 'app-footer',
  standalone: false,
  template: `
    <footer class="text-center text-muted py-3 small">
      © {{ year }} — {{ appName }}
    </footer>
  `,
})
export class Footer {
  readonly year = new Date().getFullYear();
  readonly appName = APP_CONFIG.appName;
}
