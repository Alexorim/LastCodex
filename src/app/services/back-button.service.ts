import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { App } from '@capacitor/app';
import { SettingsService } from './settings.service';

export type OverlayCloseFn = () => boolean | void;

@Injectable({
  providedIn: 'root'
})
export class BackButtonService {
  private router = inject(Router);
  private platform = inject(Platform);
  private toastCtrl = inject(ToastController);
  private settingsService = inject(SettingsService);

  private overlayStack: OverlayCloseFn[] = [];
  private lastBackPress = 0;
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
    // 1. Capacitor native Android back button event
    App.addListener('backButton', () => {
      this.handleBackButton();
    });

    // 2. Ionic platform back button with high priority (9999)
    this.platform.backButton.subscribeWithPriority(9999, (processNextHandler) => {
      const handled = this.handleBackButton();
      if (!handled && processNextHandler) {
        processNextHandler();
      }
    });
  }

  public handleBackButton(): boolean {
    // Priority 1: Check custom overlay stack
    while (this.overlayStack.length > 0) {
      const closeFn = this.overlayStack.pop();
      if (closeFn) {
        const handled = closeFn();
        if (handled !== false) {
          return true; // Successfully closed an overlay
        }
      }
    }

    // Priority 2: Check any DOM overlays (Ionic modals, alerts, custom backdrops)
    const domOverlay = document.querySelector(
      'ion-modal.can-go-back, ion-alert, ion-action-sheet, ion-popover, .modal-backdrop, .export-modal-backdrop, .events-modal-backdrop, .material-modal-backdrop'
    );
    if (domOverlay) {
      // Find close button inside DOM overlay if any
      const closeBtn = domOverlay.querySelector(
        '.modal-close-btn, .banner-close-btn, [data-action="close"], .alert-button-cancel'
      ) as HTMLElement | null;
      if (closeBtn) {
        closeBtn.click();
        return true;
      }
    }

    // Priority 3: Check current route
    const currentUrl = this.router.url.split('?')[0];
    if (currentUrl !== '/home' && currentUrl !== '/') {
      // If anywhere other than /home, navigate back to /home
      this.router.navigate(['/home']);
      return true;
    }

    // Priority 4: Double back to exit on /home
    const now = Date.now();
    if (now - this.lastBackPress < 2000) {
      App.exitApp();
      return true;
    }

    this.lastBackPress = now;
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
