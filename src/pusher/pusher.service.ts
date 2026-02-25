// pusher.service.ts
import { Injectable } from '@nestjs/common';
import * as OneSignal from '@onesignal/node-onesignal';

@Injectable()
export class PusherService {
  private client: OneSignal.DefaultApi;
  private customerClient: OneSignal.DefaultApi;

  constructor() {

    console.log("ONESIGNAL_APP_ID: ", process.env.ONESIGNAL_APP_ID)
    console.log("ONESIGNAL_API_KEY: ", process.env.ONESIGNAL_API_KEY)
    console.log("CUSTOMER_ONESIGNAL_APP_ID: ", process.env.CUSTOMER_ONESIGNAL_APP_ID)
    console.log("CUSTOMER_ONESIGNAL_API_KEY: ", process.env.CUSTOMER_ONESIGNAL_API_KEY)

    const configuration = OneSignal.createConfiguration({
      organizationApiKey: process.env.ONESIGNAL_APP_ID,
      restApiKey: process.env.ONESIGNAL_API_KEY
    });

    this.client = new OneSignal.DefaultApi(
      configuration
    );

    const customer_configuration = OneSignal.createConfiguration({
      organizationApiKey: process.env.CUSTOMER_ONESIGNAL_APP_ID,
      restApiKey: process.env.CUSTOMER_ONESIGNAL_API_KEY,
    });

    this.customerClient = new OneSignal.DefaultApi(customer_configuration);
  }

  async sendPushNotification(
    externalUserIds: string[],
    title: string,
    content: string,
    additionalData = null,
    url = null,
  ) {
    const notification = new OneSignal.Notification();

    notification.app_id = process.env.ONESIGNAL_APP_ID;
    notification.include_aliases = {
      "external_id": externalUserIds
    };
    notification.headings = { en: title };
    notification.contents = {
      en: content,
    };
    notification.target_channel = "push";
    notification.data = additionalData;
    notification.ios_badge_type = 'Increase';
    notification.ios_badge_count = 1;
    if (url) {
      notification.url = url;
    }

    try {
      const result = await this.client.createNotification(notification);
      console.log("sending push notification result: ", result)
      return result;
    } catch (error) {
      console.log('send push notification error: ', error);
    }
  }

  async sendPushNotificationToCustomer(
    externalUserIds: string[],
    title: string,
    content: string,
    additionalData = null,
  ) {
    const notification = new OneSignal.Notification();
    notification.app_id = process.env.CUSTOMER_ONESIGNAL_APP_ID;
    notification.include_aliases = {
      "external_id": externalUserIds
    }
    notification.headings = { en: title };
    notification.contents = {
      en: content,
    };
    notification.target_channel = "push";
    notification.data = additionalData;

    try {
      const result = await this.customerClient.createNotification(notification);
      console.log("sending customer push notification result: ", result)
    } catch (error) {
      console.log('send customerpush notification error: ', error);
    }
  }
}
