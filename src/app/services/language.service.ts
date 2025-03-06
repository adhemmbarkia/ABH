import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly STORAGE_KEY = 'selectedLanguage';

  constructor(private translate: TranslateService) {
    const storedLang = localStorage.getItem(this.STORAGE_KEY);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = storedLang || browserLang || 'en';

    this.translate.setDefaultLang(defaultLang);
    this.translate.use(defaultLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang); 
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }

  instant(key: string | Array<string>, interpolateParams?: Object): string {
    return this.translate.instant(key, interpolateParams);
  }

  // Add get method that returns Observable
  get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
    return this.translate.get(key, interpolateParams);
  }

  // Add method for complex translations with multiple keys
  getMultiple(keys: string[]): Observable<any> {
    return forkJoin(keys.map(key => this.translate.get(key)));
  }

  get onLangChange(): Observable<any> {
    return this.translate.onLangChange;
  }
}
