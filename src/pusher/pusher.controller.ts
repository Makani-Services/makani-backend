import { Controller, Post, Body } from '@nestjs/common';
import { PusherService } from './pusher.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly pusherService: PusherService) {}

}
