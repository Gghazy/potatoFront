import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { STORAGE_KEYS } from '../constants/app.constants';
import { SeasonsService } from '../../features/seasons/seasons.service';
import { Season } from '../../shared/Models/seasons/season.models';

/**
 * Holds the currently selected season for the app.
 * - `selectedSeasonId() === null` means "all seasons" view (no filter).
 * - The selected id is persisted to localStorage so refreshing keeps the choice.
 * - The list of seasons is loaded after login by AuthService / AppComponent.
 */
@Injectable({ providedIn: 'root' })
export class SeasonContextService {
  private readonly isBrowser: boolean;
  private seasonsService = inject(SeasonsService);

  seasons = signal<Season[]>([]);
  selectedSeasonId = signal<number | null>(null);
  loaded = signal<boolean>(false);

  selectedSeason = computed(() => {
    const id = this.selectedSeasonId();
    if (id === null) return null;
    return this.seasons().find(s => s.id === id) ?? null;
  });

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.selectedSeasonId.set(this.readStoredId());
  }

  private readStoredId(): number | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(STORAGE_KEYS.SEASON_ID);
    if (!raw) return null;
    const v = Number(raw);
    return Number.isFinite(v) && v > 0 ? v : null;
  }

  private writeStoredId(id: number | null): void {
    if (!this.isBrowser) return;
    if (id === null) localStorage.removeItem(STORAGE_KEYS.SEASON_ID);
    else localStorage.setItem(STORAGE_KEYS.SEASON_ID, String(id));
  }

  /** Loads seasons from API. Auto-selects the default season on first load if nothing is stored. */
  load(): void {
    this.seasonsService.getAll().subscribe({
      next: list => {
        this.seasons.set(list);
        this.loaded.set(true);

        // If the stored id no longer exists (e.g. season was deleted), drop it.
        const current = this.selectedSeasonId();
        if (current !== null && !list.find(s => s.id === current)) {
          this.setSelectedSeason(null);
        }

        // First time on this device: pick the default season for the tenant.
        if (current === null && !this.readStoredFlag()) {
          const def = list.find(s => s.isDefault);
          if (def) this.setSelectedSeason(def.id);
          this.markAsInitialized();
        }
      },
      error: () => {
        this.loaded.set(true);
      },
    });
  }

  setSelectedSeason(id: number | null): void {
    this.selectedSeasonId.set(id);
    this.writeStoredId(id);
    this.markAsInitialized();
  }

  /** Called when a season is created/updated/deleted to keep the local cache fresh. */
  refresh(): void {
    this.seasonsService.getAll().subscribe(list => this.seasons.set(list));
  }

  clear(): void {
    this.seasons.set([]);
    this.selectedSeasonId.set(null);
    this.loaded.set(false);
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEYS.SEASON_ID);
      localStorage.removeItem(STORAGE_KEYS.SEASON_ID + '_init');
    }
  }

  // Tracks whether the auto-pick-default has already run on this device,
  // so explicitly choosing "كل المواسم" (null) is remembered across refreshes.
  private readStoredFlag(): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(STORAGE_KEYS.SEASON_ID + '_init') === '1';
  }
  private markAsInitialized(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.SEASON_ID + '_init', '1');
  }
}
