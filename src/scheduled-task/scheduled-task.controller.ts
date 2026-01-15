import { Controller, Get, Query } from '@nestjs/common';
import { ScheduledTaskService } from './scheduled-task.service';

@Controller('api/scheduled-task')
export class ScheduledTaskController {
  constructor(private readonly scheduledTaskService: ScheduledTaskService) {}

  //iOS
  @Get('get_version_info/ios')
  async getiOSVersionInfo() {
    return {
      platform: 'ios',
      latest_version: '2.0.0',
      force_update: true,
    };
  }

  //Android
  @Get('get_version_info/android')
  async getAndroidVersionInfo() {
    return {
      platform: 'android',
      latest_version: '2.0.0',
      force_update: true,
    };
  }

  // @Get('get_version_info')
  // async getVersionInfo() {
  //   return {
  //     latest_version: '1.9',
  //     force_update: true,
  //   };
  // }
}

//   https://makani.services/api/scheduled-task/get_version_info/ios
//   https://makani.services/api/scheduled-task/get_version_info/android
//   https://makani.services/api/scheduled-task/get_version_info

//   https://test.makani.services/api/scheduled-task/get_version_info/ios
//   https://test.makani.services/api/scheduled-task/get_version_info/android
//   https://test.makani.services/api/scheduled-task/get_version_info
