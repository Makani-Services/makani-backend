// pusher.service.ts
import { Injectable } from '@nestjs/common';
import * as OneSignal from '@onesignal/node-onesignal';

@Injectable()
export class PusherService {
  private client: OneSignal.DefaultApi;
  private customerClient: OneSignal.DefaultApi;
  constructor() {
    // this.pusher = new Pusher({
    //   appId: "1697445",
    //   key: "14a5c13e2017d06f250c",
    //   secret: "1a914d63d5b0d8dd2827",
    //   cluster: "us2",
    // });

    const appKeyProvider = {
      getToken() {
        const apiKey = process.env.ONESIGNAL_API_KEY;
        if (!apiKey) {
          throw new Error('ONESIGNAL_API_KEY is not configured');
        }
        return apiKey;
      },
    };
    const configuration = OneSignal.createConfiguration({
      authMethods: {
        app_key: {
          tokenProvider: appKeyProvider,
        },
      },
    });
    this.client = new OneSignal.DefaultApi(configuration);

    const customer_app_key_provider = {
      getToken() {
        const appID =
          process.env.NODE_ENV == 'production'
            ? 'os_v2_app_ejoq4safs5hmbekt4azx7lodjjphkx6x7l2uzqu2pzof3nkeejsc5gw5ehtki3gxisfobxbz2xoydw54hvtsffmix64t7r4n5g6rihi'
            : process.env.NODE_ENV == 'staging'
            ? 'os_v2_app_ep5sbhuswjcdfkvx25b7x47q3kxsidye3wdekn4urzkltcnqrjdvcd34tswadspqku33cqyxkld37vijpa7txubdnzjcukwbahuikay'
            : 'os_v2_app_ep5sbhuswjcdfkvx25b7x47q3kxsidye3wdekn4urzkltcnqrjdvcd34tswadspqku33cqyxkld37vijpa7txubdnzjcukwbahuikay';
        return appID;
      },
    };

    const customer_configuration = OneSignal.createConfiguration({
      authMethods: {
        app_key: {
          tokenProvider: customer_app_key_provider,
        },
      },
    });

    this.customerClient = new OneSignal.DefaultApi(customer_configuration);
  }

  async sendPushNotification(
    externalUserIds: string[],
    title: string,
    content: string,
    additionalData = null,
  ) {
    const notification = new OneSignal.Notification();
    const appID = process.env.ONESIGNAL_APP_ID;
    // process.env.NODE_ENV == 'production'
    //   ? '7b554f0c-68e1-4701-97cb-9d46554611e7'
    //   : process.env.NODE_ENV == 'staging'
    //   ? // ? '78cf09be-f363-4294-838d-695eb71bdee6'    //staging
    //     '3ac1ffc4-597a-4a4e-a9b2-2fb6a67f17d4' //test
    //   : '6421c1e6-f5ed-4b26-8df7-dca0d80bf80f';
    notification.app_id = appID;
    // notification.app_id = "7b554f0c-68e1-4701-97cb-9d46554611e7";
    // notification.include_aliases = {alias_label: ["Email"]};
    notification.include_external_user_ids = externalUserIds;
    notification.headings = { en: title };
    notification.contents = {
      en: content,
    };
    notification.data = additionalData;

    try {
      const result = await this.client.createNotification(notification);
      console.log(
        '🚀 ~ PusherService ~ sendPushNotification ~ result:',
        result,
      );
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
    const appID =
      process.env.NODE_ENV == 'production'
        ? '225d0e48-0597-4ec0-9153-e0337fadc34a'
        : process.env.NODE_ENV == 'staging'
        ? '23fb209e-92b2-4432-aab7-d743fbf3f0da'
        : '23fb209e-92b2-4432-aab7-d743fbf3f0da';
    notification.app_id = appID;
    // notification.app_id = "7b554f0c-68e1-4701-97cb-9d46554611e7";
    // notification.include_aliases = {alias_label: ["Email"]};
    notification.include_external_user_ids = externalUserIds;
    notification.headings = { en: title };
    notification.contents = {
      en: content,
    };
    notification.data = additionalData;

    try {
      await this.customerClient.createNotification(notification);
    } catch (error) {
      console.log('send push notification error: ', error);
    }
  }
}
