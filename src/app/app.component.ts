import { Component, inject } from '@angular/core';
import { BackButtonService } from './services/back-button.service';
import { WidgetBridgeService } from './services/widget-bridge.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private backButtonService = inject(BackButtonService);
  private widgetBridgeService = inject(WidgetBridgeService);

  constructor() {}
}
