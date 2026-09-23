import { Component, inject } from '@angular/core';
import { BackButtonService } from './services/back-button.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  private backButtonService = inject(BackButtonService);

  constructor() {}
}
