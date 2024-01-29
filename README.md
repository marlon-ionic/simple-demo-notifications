# Simple Demo - Notifications

This is a simple demo of how to use the Local and Push Notifications in a Capacitor Project. The Push Notifications are powered by [Google Firebase](https://firebase.google.com). For more information about the Firebase Push Notifications with a Capacitor app, please check the [Capacitor Documentation](https://capacitorjs.com/docs/guides/push-notifications-firebase).

## How to use

1. Clone this repository
2. Run `npm install` to install all dependencies
3. Run `ionic build` to build the web assets
4. Run `npx cap sync` to sync the web assets with the native projects
5. Run `npx cap open ios` to open the iOS project in Xcode
6. Run `npx cap open android` to open the Android project in Android Studio

Please note that you'll need to provide your own `GoogleService-Info.plist` and `google-services.json` files in order to use the Push Notifications. For more information, please check the [Capacitor Documentation](https://capacitorjs.com/docs/guides/push-notifications-firebase).
