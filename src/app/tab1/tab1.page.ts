import { Component, NgZone, OnInit, inject } from '@angular/core';
import { Clipboard } from '@capacitor/clipboard';
import { IonHeader, IonActionSheet, ActionSheetButton, IonButton, IonIcon, IonToast, IonToolbar, IonTitle, IonContent, IonInput, IonTextarea, IonList, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, ToastController } from '@ionic/angular/standalone';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { clipboardOutline, notificationsOffOutline, trash, shareOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [DatePipe, IonActionSheet, IonButton, IonIcon, IonToast, IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonTextarea, IonList, IonItem, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle],
})
export class Tab1Page implements OnInit{
  private readonly zone = inject(NgZone);
  private readonly toastController = inject(ToastController);
  token?: string;
  notifications: PushNotificationSchema[] = [];
  permissionsAreDenied = false;

  constructor() {
    addIcons({ clipboardOutline, notificationsOffOutline, shareOutline, trash });
  }

  converNotificationTSToDate(str?: string | null): Date | undefined  {
    if(str) {
      return new Date(parseInt(str, 10)*1000);
    }
    return undefined;
  }

  async ngOnInit() {
    //Load any previously saved notifications
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

    if(!Capacitor.isNativePlatform()) {
      // PushNotifications is unavailable in the browser
      return;
    }
    try {
      const permissionStatus = await PushNotifications.requestPermissions();
      if(permissionStatus.receive === 'granted'){
        this.initPushListeners();
        await PushNotifications.register();
      } else if(permissionStatus.receive === 'denied') {
        this.permissionsAreDenied = true;
      }
    }catch(e){
      console.log(e);
    }
  }
  async copyToken() {
    if(this.token) {
      await Clipboard.write({
        string: this.token
      });
     await this.presentToast('Token copied to clipboard');
    }
  }
  async shareToken() {
    if(this.token) {
      const canShareResult = await Share.canShare();
      if(canShareResult.value === false) {
        await this.presentToast('Sharing not available', 'danger');
        return;
      }
      await Share.share({
        text: this.token
      });
    }
  }

  clearNotifications() {
    this.notifications = [];
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  private initPushListeners() {
    PushNotifications.addListener('registration', (token: Token) => {
      console.log('registration:', token);
      // alert('Push registration success, token: ' + token.value);
      this.zone.run(() => {
        this.token = token.value;
      });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.log('registrationError:', error);
      // alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('pushNotificationReceived:', notification);
        // alert('Push received: ' + JSON.stringify(notification));
        this.zone.run(() => {
          this.notifications.push(notification);
        });
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
        console.log('pushNotificationActionPerformed:', notification);
        this.zone.run(() => {
          if(notification.notification)
          this.notifications.push(notification.notification);
        });
      },
    );
  }
  private async presentToast(message = 'Hello World!', color: string | undefined = undefined) {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 5000,
      position: 'bottom',
    });

    await toast.present();
  }

  public actionSheetButtons: ActionSheetButton[] = [
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => this.clearNotifications()
    },
    {
      text: 'Cancel',
      role: 'cancel'
    },
  ];
}
