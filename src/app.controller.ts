import { Controller, Get, Inject, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { MATH_SERVICE } from './constants/variables.contants';
import { firstValueFrom, lastValueFrom, Observable, timeout } from 'rxjs';

@Controller()
export class AppController implements OnApplicationBootstrap {
  private readonly loggger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    @Inject(MATH_SERVICE) private client: ClientProxy
  ) { }

  async onApplicationBootstrap() {
    await this.client.connect();
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
    // const result = await firstValueFrom(this.accumulate())

    // Explicitly subscribing the cold observable using subscribe method
    // const result = this.accumulate().subscribe({
    //   next: (data) => console.log('Response:', data), // Handle the response
    //   error: (err) => console.error('Error:', err),  // Handle errors
    //   complete: () => console.log('Complete'),      // When the stream is done
    // });

    // console.log({ result });
    return "Message sent successfully!";
  }

  @Get('publish')
  publishEvent(): string {
    this.publish();
    return "Event published successfully!";
  }
}
