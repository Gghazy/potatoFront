import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG, SupportedLanguage } from '../config/config';
import { STORAGE_KEYS } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);

  init(): Promise<void> {
    const saved = (localStorage.getItem(STORAGE_KEYS.LANG) as SupportedLanguage | null) ?? APP_CONFIG.defaultLanguage;
    return this.use(saved as SupportedLanguage);
  }

  use(lang: SupportedLanguage): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    return new Promise(resolve => {
      this.translate.use(lang).subscribe(() => resolve());
    });
  }

  current(): SupportedLanguage {
    return (this.translate.currentLang as SupportedLanguage) ?? APP_CONFIG.defaultLanguage;
  }
}
