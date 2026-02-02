import { Body, Controller, Get, Query } from '@nestjs/common';
import { ScheduledTaskService } from './scheduled-task.service';
import { UserService } from 'src/user/user.service';

@Controller('api/scheduled-task')
export class ScheduledTaskController {
  constructor(
    private readonly scheduledTaskService: ScheduledTaskService,
    private readonly userService: UserService,
  ) { }

  //iOS
  @Get('get_version_info/ios')
  async getiOSVersionInfo(@Query() query: any) {
    // const { userId } = query;
    // const user = await this.userService.getUserById(userId);

    // let force_update = false;
    // if (user.branches[0].name === 'Hawaii') {
    //   force_update = false;
    // }
    return {
      platform: 'ios',
      latest_version: '2.0.7',
      force_update: false,
    };
  }

  //Android
  @Get('get_version_info/android')
  async getAndroidVersionInfo(@Query() query: any) {
    // const { userId } = query;
    // const user = await this.userService.getUserById(userId);

    // let force_update = false;
    // if (user.branches[0].name == 'Hawaii') {
    //   force_update = false;
    // }
    return {
      platform: 'android',
      latest_version: '2.0.7',
      force_update: false,
    };
  }


  //iOS
  @Get('get_version_info_for_customer/ios')
  async getiOSVersionInfoForCustomer(@Query() query: any) {
    // const { userId } = query;
    // const user = await this.userService.getUserById(userId);

    // let force_update = false;
    // if (user.branches[0].name === 'Hawaii') {
    //   force_update = false;
    // }
    return {
      platform: 'ios',
      latest_version: '1.0.3',
      force_update: false,
    };
  }

  //Android
  @Get('get_version_info_for_customer/android')
  async getAndroidVersionInfoForCustomer(@Query() query: any) {
    // const { userId } = query;
    // const user = await this.userService.getUserById(userId);

    // let force_update = false;
    // if (user.branches[0].name == 'Hawaii') {
    //   force_update = false;
    // }
    return {
      platform: 'android',
      latest_version: '1.0.3',
      force_update: false,
    };
  }


}

//   https://makani.services/api/scheduled-task/get_version_info/ios
//   https://makani.services/api/scheduled-task/get_version_info/android
//   https://makani.services/api/scheduled-task/get_version_info

//   https://test.makani.services/api/scheduled-task/get_version_info/ios
//   https://test.makani.services/api/scheduled-task/get_version_info/android
//   https://test.makani.services/api/scheduled-task/get_version_info
