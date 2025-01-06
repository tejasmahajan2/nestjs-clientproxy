import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! <br> <a href="http://localhost:3000/publish">Publish Event</a> <br> <a href="http://localhost:3000/message">Send Message</a>';
  }
}
