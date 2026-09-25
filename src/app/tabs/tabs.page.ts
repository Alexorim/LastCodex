import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { home, homeOutline, search, searchOutline, calendar, calendarOutline, map, mapOutline, book, bookOutline, settings, settingsOutline } from 'ionicons/icons';
import { SettingsService, Language } from '../services/settings.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit, OnDestroy {
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  currentLang: Language = 'es';

  private isFooterVisible = false;
  private scrollListener?: (e: Event) => void;
  private routerSub?: Subscription;

  constructor() {
    addIcons({
      home,
      homeOutline,
      search,
      searchOutline,
      calendar,
      calendarOutline,
      map,
      mapOutline,
      book,
      bookOutline,
      settings,
      settingsOutline
    });
  }

  async openMapWarning(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const isEs = this.currentLang === 'es';
    const alert = await this.alertController.create({
      header: isEs ? 'Mapa de Aethric' : 'Aethric Map',
      subHeader: isEs ? 'Fase de prueba' : 'Testing phase',
      message: isEs
        ? 'El mapa está en fase de prueba y puede tener problemas de rendimiento.'
        : 'The map is in testing phase and may have performance issues.',
      backdropDismiss: true,
      buttons: [
        {
          text: isEs ? 'Cancelar' : 'Cancel',
          role: 'cancel'
        },
        {
          text: isEs ? 'Aceptar' : 'Accept',
          handler: () => {
            this.router.navigate(['/map']);
          }
        }
      ]
    });

    await alert.present();
  }

  ngOnInit() {
    this.settingsService.lang$.subscribe(lang => {
      this.currentLang = lang;
    });

    this.setupFooterScrollWatcher();
  }

  private setupFooterScrollWatcher(): void {
    if (typeof window === 'undefined') return;

    this.scrollListener = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target || typeof target.scrollHeight !== 'number') return;

      // Only evaluate scroll containers with enough scrollable content
      if (target.scrollHeight <= target.clientHeight + 40) return;

      const distanceToBottom = target.scrollHeight - (target.scrollTop + target.clientHeight);

      // Reached the bottom where the footer is located
      const reachedBottom = distanceToBottom < 130 && target.scrollTop > 40;

      if (reachedBottom !== this.isFooterVisible) {
        this.isFooterVisible = reachedBottom;
        if (reachedBottom) {
          document.body.classList.add('footer-visible');
        } else {
          document.body.classList.remove('footer-visible');
        }
      }
    };

    window.addEventListener('scroll', this.scrollListener, true);

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isFooterVisible = false;
        document.body.classList.remove('footer-visible');
      });
  }

  ngOnDestroy(): void {
    if (this.scrollListener && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollListener, true);
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    document.body.classList.remove('footer-visible');
  }
}
