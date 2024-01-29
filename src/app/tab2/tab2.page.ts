import { Component, NgZone, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, DeliveredNotificationSchema, LocalNotificationSchema, LocalNotifications, PendingLocalNotificationSchema } from '@capacitor/local-notifications';
import { IonList, IonCard, IonCardContent, IonCardSubtitle, IonCardHeader, IonCardTitle, SegmentCustomEvent, IonActionSheet, IonDatetimeButton, IonDatetime, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonFabList, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonSegment, IonSegmentButton, IonTextarea, IonTitle, IonToolbar, ActionSheetController } from '@ionic/angular/standalone';
import { OverlayEventDetail, ActionSheetButton } from '@ionic/core/components';
import { addIcons } from 'ionicons';
import { addOutline, helpCircleOutline, personCircleOutline, trash } from 'ionicons/icons';
import { add } from "date-fns";
import { DatePipe } from '@angular/common';
import { sort } from 'radash';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [ IonList, IonCard, DatePipe, IonCardContent, IonCardSubtitle, IonCardHeader, IonCardTitle, FormsModule, IonDatetimeButton, IonDatetime, IonTextarea, IonHeader, IonItem, IonButtons,IonInput, IonModal, IonFabButton, IonFabList, IonFab, IonIcon, IonToolbar, IonLabel, IonTitle, IonContent,IonSegment, IonSegmentButton, IonActionSheet, IonButton]
})
export class Tab2Page implements OnInit{
  @ViewChild(IonModal) modal?: IonModal;
  private readonly zone = inject(NgZone);
  private readonly actionSheetController = inject(ActionSheetController);
  permissionsAreDenied = false;
  startingId = 0;
  scheduleDateTime?: string;
  scheduleTitle?: string;
  scheduleBody?: string;
  notifications: any[] = [];
  delivered: DeliveredNotificationSchema[] = [];
  pending: PendingLocalNotificationSchema[] = [];
  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name?: string;

  cancel() {
    this.modal?.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal?.dismiss(this.name, 'confirm');
    const scheduleAtDate = this.scheduleDateTime ? new Date(this.scheduleDateTime) : add(new Date(), { days: 1, hours: 1, minutes: 1});
    this.schedule([{
      id: this.startingId++,
      body: this.scheduleBody || 'Message Body',
      title: this.scheduleTitle || 'Message Title',
      schedule: { at: scheduleAtDate }
    }]);
  }

  onWillDismiss(event: Event) {
    console.log('will dismiss', event);
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  constructor() {
    addIcons({ addOutline, helpCircleOutline, personCircleOutline, trash });
  }

  async segmentChanged(ev: SegmentCustomEvent | 'all' | 'delivered' | 'scheduled' = 'all') {
    const segmentValue = typeof ev === 'string' ? ev : ev.detail.value;
    switch(segmentValue) {
      case 'delivered':
        const deliveredResult = (await LocalNotifications.getDeliveredNotifications());
        this.delivered = deliveredResult.notifications;
        this.notifications = sort(this.delivered, x => new Date(x.schedule?.at!).getTime(), true);
        break;
        case 'scheduled':
          const pendingResult = (await LocalNotifications.getPending());
          this.pending = pendingResult.notifications;
          this.notifications = this.pending;
          break;
          case 'all':
            const allPendingResult = (await LocalNotifications.getPending());
            const allDeliveredResult = (await LocalNotifications.getDeliveredNotifications());
            this.notifications = [...allPendingResult.notifications, ...allDeliveredResult.notifications];
            break;
    }
    this.notifications = sort(this.notifications.filter(n => n.title !== undefined), x => new Date(x.schedule?.at!).getTime(), true);
    console.log('Segment changed', ev, this.notifications.length, this.notifications);
  }

  async scheduleRandomNotifications(count = 10) {
    const notifications = this.randomLocalNotifications(count);
    await this.schedule(notifications);
    this.segmentChanged('all');
  }

  async schedule(notifications: LocalNotificationSchema[]) {
    await LocalNotifications.schedule({
      notifications
    });
  }

  randomLocalNotifications(count: number = 10): LocalNotificationSchema[] {
    const arr: LocalNotificationSchema[] = [];
    const now = new Date();
    for(let i = 0; i < count; i++) {
      const notification: LocalNotificationSchema = {
        body: `Local Notification #${i}`,
        id: this.startingId++,
        title: 'Local Notification',
        schedule: { at: add(now, { days:i, hours: i }) }
      }
      arr.push(notification);
    }
    return arr;
  }

  async ngOnInit() {
    if(!Capacitor.isNativePlatform()) {
      // LocalNotifications is unavailable in the browser
      return;
    }
    try {
      const permissionStatus = await LocalNotifications.requestPermissions();
      if(permissionStatus.display === 'granted'){
        this.initPushListeners();
      } else if(permissionStatus.display === 'denied') {
        this.permissionsAreDenied = true;
      }
    }catch(e){
      console.log(e);
    }
  }

  async clearNotifications() {
    const actionSheet = await this.actionSheetController.create({
        header: 'Clear Pending Notifications?',
        buttons: this.actionSheetButtons
      });
      await actionSheet.present();
  }

  private async doClearPenidngNotifications() {
    //Clear any pending notifications
    try {
      const pendingResult = await LocalNotifications.getPending();
      const pendingIds = pendingResult.notifications.map(n => { return { id: n.id }});
      await LocalNotifications.cancel({ notifications: pendingIds });
      this.segmentChanged('all');
    } catch(e) {
      console.error(e);
    }
    this.segmentChanged('all');
    this.notifications = [];
  }

  private initPushListeners() {
    LocalNotifications.addListener(
      'localNotificationReceived',
      (notification: LocalNotificationSchema) => {
        console.log('localNotificationReceived:', notification);
        // alert('Push received: ' + JSON.stringify(notification));
        this.zone.run(() => {
          // this.notifications.push(notification);
        });
        // localStorage.setItem('notifications', JSON.stringify(this.notifications));
      },
    );

    LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (notification: ActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
        console.log('localNotificationActionPerformed:', notification);
        this.zone.run(() => {
          this.notifications.push(notification.notification);
          //if(notification.notification)
          // this.notifications.push(notification.notification);
        });
      },
    )
  }

  public actionSheetButtons: ActionSheetButton[] = [
    {
      text: 'Delete',
      role: 'destructive',
      handler: async () => await this.doClearPenidngNotifications()
    },
    {
      text: 'Cancel',
      role: 'cancel'
    },
  ];

}
