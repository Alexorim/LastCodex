import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Language = 'es' | 'en';
export type ThemeMode = 'codex-dark' | 'amoled';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly LANG_KEY = 'lastcodex_lang';
  private readonly THEME_KEY = 'lastcodex_theme';

  private langSubject = new BehaviorSubject<Language>(
    (localStorage.getItem(this.LANG_KEY) as Language) || 'es'
  );
  public lang$ = this.langSubject.asObservable();

  private themeSubject = new BehaviorSubject<ThemeMode>(
    (localStorage.getItem(this.THEME_KEY) as ThemeMode) || 'codex-dark'
  );
  public theme$ = this.themeSubject.asObservable();

  get currentLang(): Language {
    return this.langSubject.value;
  }

  get currentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  setLanguage(lang: Language): void {
    this.langSubject.next(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    document.body.classList.remove('theme-codex-dark', 'theme-amoled');
    document.body.classList.add(`theme-${theme}`);
  }
}
