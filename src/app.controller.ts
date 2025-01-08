import { Controller, Get, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { MATH_SERVICE, MQTT_SERVICE, REDIS_SERVICE } from './constants/variables.contants';
import { firstValueFrom, lastValueFrom, Observable, timeout } from 'rxjs';

@Controller()
export class AppController implements OnApplicationBootstrap {
  private readonly loggger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    @Inject(MATH_SERVICE) private client: ClientProxy,
    @Inject(REDIS_SERVICE) private redisClient: ClientProxy,
    @Inject(MQTT_SERVICE) private mqttClient: ClientProxy,
  ) { }

  async onApplicationBootstrap() {
    await this.client.connect();
    // await this.redisClient.connect();
    await this.mqttClient.connect();
    this.loggger.log("Connected to microservice.");
  }

  accumulate(): Observable<number> {
    const pattern = { cmd: 'sum' };
    const payload = [1, 2, 3];
    return this.client
      .send<number>(pattern, payload)
      .pipe(timeout(3000));
  }

  async publish() {
    this.client
      .emit<number>('user_created', {
        email: "test@gmail.com",
        name: "Test User",
        sub: "Welcome to Microservice!"
      })
      .pipe(timeout(3000));
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('message')
  async publishMessage(): Promise<string> {
    // Implicitly subscribing the cold observable using firstValueFrom or lastValueFrom
    const result = await firstValueFrom(this.accumulate())

    // Explicitly subscribing the cold observable using subscribe method
    // const result = this.accumulate().subscribe({
    //   next: (data) => console.log('Response:', data), // Handle the response
    //   error: (err) => console.error('Error:', err),  // Handle errors
    //   complete: () => console.log('Complete'),      // When the stream is done
    // });

    console.log({ result });
    return "Message sent successfully!";
  }

  @Get('publish')
  publishEvent(): string {
    this.publish();
    return "Event published successfully!";
  }

  sendNotification(): Observable<number> {
    const pattern = { cmd: 'notifications' };
    const payload = [1, 2, 3];
    try {
      return this.redisClient
        .send<number>(pattern, payload)
        .pipe(timeout(15000));
    } catch (error) {
      console.log(error);
    }
  }

  add(): Observable<number> {
    const pattern = { cmd: 'add' };
    const payload = [1, 2, 3];
    try {
      return this.redisClient
        .send<number>(pattern, payload)
        .pipe(timeout(15000));
    } catch (error) {
      console.log(error);
    }
  }


  async publishToRedis() {
    this.redisClient
      .emit<number>('user_created', {
        email: "test@gmail.com",
        name: "Test User",
        sub: "Welcome to Microservice!"
      })
      .pipe(timeout(3000));
  }

  @Get('notification')
  async pubishNotification() {
    this.publishToRedis()
    const result1 = await firstValueFrom(this.sendNotification())
    const result2 = await lastValueFrom(this.add())
    console.log({ result1, result2 });
    return "notification event published successfully!";
  }

  @Get('add')
  async publishAdd() {
    const result2 = await lastValueFrom(this.add())
    console.log({ result2 });
    return "notification event published successfully!";
  }

  @Get('getNotifications')
  async getNotifications() {
    const result2 = await lastValueFrom(this.mqttClient.send('notifications', [1, 2, 3]))
    console.log({ result2 });
    return "getNotifications event published successfully!";
  }


}
