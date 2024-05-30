import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { RealIP } from 'nestjs-real-ip';
import { CheckInDto } from './app.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('check-in')
  async checkInByIP(@RealIP() ip: string, @Body() payload: CheckInDto) {
    return this.appService.checkIn(ip, payload);
  }
}
