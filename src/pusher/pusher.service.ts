// pusher.service.ts
import { Injectable } from '@nestjs/common';
import * as OneSignal from '@onesignal/node-onesignal';

@Injectable()
export class PusherService {
  private client: OneSignal.DefaultApi;
  private customerClient: OneSignal.DefaultApi;

  private appId =
  process.env.NODE_ENV == 'production'
    ? '7b554f0c-68e1-4701-97cb-9d46554611e7'
    : process.env.NODE_ENV == 'staging'
    ? // ? '78cf09be-f363-4294-838d-695eb71bdee6'    //staging
      '3ac1ffc4-597a-4a4e-a9b2-2fb6a67f17d4' //test
    : '6421c1e6-f5ed-4b26-8df7-dca0d80bf80f';

  private customer_appId = process.env.NODE_ENV == 'production'
    ? '225d0e48-0597-4ec0-9153-e0337fadc34a'
    : process.env.NODE_ENV == 'staging'
    ? '23fb209e-92b2-4432-aab7-d743fbf3f0da'
    : '23fb209e-92b2-4432-aab7-d743fbf3f0da';

  constructor() {
    // this.pusher = new Pusher({
    //   appId: "1697445",
    //   key: "14a5c13e2017d06f250c",
    //   secret: "1a914d63d5b0d8dd2827",
    //   cluster: "us2",
    // });

    const API_KEY=
          process.env.NODE_ENV == 'production'
            ? 'MWY3Y2JjMDgtMzIwMy00NWZiLThiMWEtNWUxYjgyNmZhMDU4'
            : process.env.NODE_ENV == 'staging'
            ? // ? 'ODc4ZDRjYWUtNWM2MS00ZTEyLThkNTAtOTk1YTBhYWExZTE5'   //staging
              'os_v2_app_hla77rczpjfe5knsf63km7yx2raghgbn6czukouxdtsef7vn46xuev544rmfvp54aq573ag7lwraza4htrssxwmbf76u6syhogjbdwq' //test
            : 'os_v2_app_mqq4dzxv5vfsndpx3sqnqc7yb55wxernsiquelvaflc5jo7unhtkywlj4drlmuakfnmbpgrgiyelun2jxew3wuufonu3ia563bhveoi';

           

    // const configuration = OneSignal.createConfiguration({
    //   authMethods: {
    //     app_key: {
    //       tokenProvider: app_key_provider,
    //     },
    //   },
    // });
    console.log("🚀 ~ PusherService ~ app_key_provider:", this.appId, API_KEY)

    const configuration = OneSignal.createConfiguration({
      organizationApiKey: this.appId,
      restApiKey: API_KEY, // App REST API key required for most endpoints
  });

    this.client = new OneSignal.DefaultApi(
      configuration
    );

    const customer_app_key = 
          process.env.NODE_ENV == 'production'
            ? 'os_v2_app_ejoq4safs5hmbekt4azx7lodjjphkx6x7l2uzqu2pzof3nkeejsc5gw5ehtki3gxisfobxbz2xoydw54hvtsffmix64t7r4n5g6rihi'
            : process.env.NODE_ENV == 'staging'
            ? 'os_v2_app_ep5sbhuswjcdfkvx25b7x47q3kxsidye3wdekn4urzkltcnqrjdvcd34tswadspqku33cqyxkld37vijpa7txubdnzjcukwbahuikay'
            : 'os_v2_app_ep5sbhuswjcdfkvx25b7x47q3kxsidye3wdekn4urzkltcnqrjdvcd34tswadspqku33cqyxkld37vijpa7txubdnzjcukwbahuikay';

   

      const customer_configuration = OneSignal.createConfiguration({
          organizationApiKey: this.customer_appId,
          restApiKey: customer_app_key, // App REST API key required for most endpoints
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
   
    notification.app_id = this.appId;
    // notification.app_id = "7b554f0c-68e1-4701-97cb-9d46554611e7";
    // notification.include_aliases = {alias_label: ["Email"]};
    notification.include_aliases = {
      "external_id": externalUserIds
    },
    notification.headings = { en: title };
    notification.contents = {
      en: content,
    };
    notification.target_channel = "push";
    notification.data = additionalData;
    notification.ios_badge_type = 'Increase';
    notification.ios_badge_count = 1;

    try {
      return await this.client.createNotification(notification);
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
    // const appID =
    //   process.env.NODE_ENV == 'production'
    //     ? '225d0e48-0597-4ec0-9153-e0337fadc34a'
    //     : process.env.NODE_ENV == 'staging'
    //     ? '23fb209e-92b2-4432-aab7-d743fbf3f0da'
    //     : '23fb209e-92b2-4432-aab7-d743fbf3f0da';
    notification.app_id = this.customer_appId;
    // notification.app_id = "7b554f0c-68e1-4701-97cb-9d46554611e7";
    // notification.include_aliases = {alias_label: ["Email"]};
    // notification.include_external_user_ids = externalUserIds;
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
