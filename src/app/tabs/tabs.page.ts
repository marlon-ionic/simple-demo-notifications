import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { phonePortraitOutline, notificationsCircleOutline, phonePortrait, notificationsCircle } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  tab = 'tab1';

  constructor() {
    addIcons({ phonePortraitOutline, notificationsCircleOutline, phonePortrait, notificationsCircle });
  }

  tabsDidChange(event: any) {
    this.tab = event.tab;
  }
}



