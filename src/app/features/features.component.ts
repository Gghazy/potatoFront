import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { SeasonContextService } from '../core/services/season-context.service';

@Component({
  selector: 'app-features',
  standalone: false,
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css'],
})
export class FeaturesComponent implements OnInit {
  private auth = inject(AuthService);
  private seasonContext = inject(SeasonContextService);

  ngOnInit(): void {
    // SuperAdmin doesn't operate inside a tenant, so it has no seasons to load.
    if (this.auth.isAuthenticated() && !this.auth.isSuperAdmin) {
      this.seasonContext.load();
    }
  }
}
