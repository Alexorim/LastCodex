import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LanguageOption {
  code: string;
  name: string;
  subname?: string;
  flag: string;
}

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)', subname: 'United States', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', subname: 'United Kingdom', flag: '🇬🇧' },
  { code: 'en-CA', name: 'English (CA)', subname: 'Canada', flag: '🇨🇦' },
  { code: 'en-AU', name: 'English (AU)', subname: 'Australia', flag: '🇦🇺' },
  { code: 'fr', name: 'Français', subname: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Español', subname: 'Spanish', flag: '🇪🇸' },
  { code: 'ru', name: 'Русский', subname: 'Russian', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', subname: 'Ukrainian', flag: '🇺🇦' },
  { code: 'de', name: 'Deutsch', subname: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', subname: 'Italian', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Português (Brasil)', subname: 'Portuguese (BR)', flag: '🇧🇷' },
  { code: 'cs', name: 'Čeština', subname: 'Czech', flag: '🇨🇿' },
  { code: 'pl', name: 'Polski', subname: 'Polish', flag: '🇵🇱' },
  { code: 'ja', name: '日本語', subname: 'Japanese', flag: '🇯🇵' },
  { code: 'vi', name: 'Tiếng Việt', subname: 'Vietnamese', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', subname: 'Indonesian', flag: '🇮🇩' },
  { code: 'zh-TW', name: '繁體中文', subname: 'Traditional Chinese', flag: '🇹🇼' },
  { code: 'zh-CN', name: '简体中文', subname: 'Simplified Chinese', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', subname: 'Korean', flag: '🇰🇷' },
  { code: 'nl', name: 'Nederlands', subname: 'Dutch', flag: '🇳🇱' },
  { code: 'nb', name: 'Norsk bokmål', subname: 'Norwegian', flag: '🇳🇴' },
  { code: 'hu', name: 'Magyar', subname: 'Hungarian', flag: '🇭🇺' }
];

export type Language = string;
export type ThemeMode = 'codex-dark' | 'amoled' | 'light';

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

  constructor() {
    // Apply saved theme on app start
    const savedTheme = (localStorage.getItem(this.THEME_KEY) as ThemeMode) || 'codex-dark';
    this.applyTheme(savedTheme);
  }

  get currentLang(): Language {
    return this.langSubject.value;
  }

  get currentTheme(): ThemeMode {
    return this.themeSubject.value;
  }

  getCurrentLanguageOption(): LanguageOption {
    const current = this.currentLang;
    const match = AVAILABLE_LANGUAGES.find(l => l.code === current || l.code.startsWith(current));
    return match || AVAILABLE_LANGUAGES.find(l => l.code === 'es') || AVAILABLE_LANGUAGES[0];
  }

  setLanguage(lang: Language): void {
    this.langSubject.next(lang);
    localStorage.setItem(this.LANG_KEY, lang);
  }

  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemeMode): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-codex-dark', 'theme-amoled', 'theme-light');
      document.body.classList.add(`theme-${theme}`);
      document.documentElement.classList.remove('theme-codex-dark', 'theme-amoled', 'theme-light');
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }
}
