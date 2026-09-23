import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController, NavController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { SettingsService } from './settings.service';

export type OverlayCloseFn = () => boolean | void;

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private platform = inject(Platform);
  private toastCtrl = inject(ToastController);
  private settingsService = inject(SettingsService);
  private ngZone = inject(NgZone);

  private overlayStack: OverlayCloseFn[] = [];
  private lastHomeBackPress = 0;
  private lastHandledTimestamp = 0;
  private isToastOpen = false;

  constructor() {
    this.initBackButtonListener();
  }

  /**
   * Registers an overlay close handler.
   * Returns an unregister function to clean up when the overlay closes.
   */
  public registerOverlay(closeFn: OverlayCloseFn): () => void {
    this.overlayStack.push(closeFn);
    return () => {
      this.unregisterOverlay(closeFn);
    };
  }

  public unregisterOverlay(closeFn: OverlayCloseFn): void {
    const idx = this.overlayStack.indexOf(closeFn);
    if (idx !== -1) {
      this.overlayStack.splice(idx, 1);
    }
  }

  private initBackButtonListener(): void {
    const onBack = () => {
      this.ngZone.run(() => {
        this.handleBackButton();
      });
    };

    // 1. Ionic platform backButton with maximum priority (99999)
    this.platform.backButton.subscribeWithPriority(99999, () => {
      onBack();
    });

    // 2. Direct Capacitor App listener as fallback (debounced to avoid duplicate triggers)
    App.addListener('backButton', () => {
      onBack();
    });
  }

  public handleBackButton(): boolean {
    const now = Date.now();

    // 1. Debounce guard: Ignore any duplicate trigger within 350ms (avoids hardware bounce / dual listener calls)
    if (now - this.lastHandledTimestamp < 350) {
      return true;
    }
    this.lastHandledTimestamp = now;

    // 2. Priority 1: Check custom registered overlay stack (modals, dialogs, sheets)
    while (this.overlayStack.length > 0) {
      const closeFn = this.overlayStack.pop();
      if (closeFn) {
        const handled = closeFn();
        if (handled !== false) {
          // Closed an overlay; reset home back exit counter and stop
          this.lastHomeBackPress = 0;
          return true;
        }
      }
    }

    // 3. Priority 2: Check any open DOM overlay elements (Ionic alerts, action-sheets, modals)
    const domOverlay = document.querySelector(
      'ion-modal.can-go-back, ion-alert, ion-action-sheet, ion-popover, .modal-backdrop, .export-modal-backdrop, .events-modal-backdrop, .material-modal-backdrop'
    );
    if (domOverlay) {
      const closeBtn = domOverlay.querySelector(
        '.modal-close-btn, .modal-close, .banner-close-btn, [data-action="close"], .alert-button-cancel'
      ) as HTMLElement | null;
      if (closeBtn) {
        closeBtn.click();
        this.lastHomeBackPress = 0;
        return true;
      }
    }

    // 4. Priority 3: Check current route
    const rawUrl = (this.router.url || '').split('?')[0].split('#')[0].replace(/^\//, '');
    const isHome = rawUrl === 'home' || rawUrl === '' || rawUrl === 'tabs/home';

    if (!isHome) {
      // If we are on ANY page other than /home (e.g. /codex, /codex/classes, /calendar, /search, /events, /settings),
      // navigate back to /home and reset the exit counter.
      this.lastHomeBackPress = 0;
      this.navCtrl.navigateRoot('/home', { animated: true, animationDirection: 'back' });
      return true;
    }

    // 5. Priority 4: On /home: Double back to exit
    if (this.lastHomeBackPress > 0 && (now - this.lastHomeBackPress) <= 2000) {
      // Second back press within 2000ms: exit application
      App.exitApp();
      return true;
    }

    // First back press on /home: record timestamp and show prompt toast
    this.lastHomeBackPress = now;
    this.showExitToast();
    return true;
  }

  private async showExitToast(): Promise<void> {
    if (this.isToastOpen) return;
    this.isToastOpen = true;

    const lang = this.settingsService.currentLang;
    const message = lang === 'es'
      ? 'Presiona de nuevo para salir'
      : 'Press back again to exit';

    const toast = await this.toastCtrl.create({
      message,
      duration: 1900,
      position: 'bottom',
      cssClass: 'codex-exit-toast'
    });

    toast.onDidDismiss().then(() => {
      this.isToastOpen = false;
    });

    await toast.present();
  }
}
