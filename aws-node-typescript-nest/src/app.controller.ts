import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  // NOTE: the injection token is spelled out explicitly (rather than relying on
  // TypeScript's `emitDecoratorMetadata` to infer it from the parameter type) because
  // esbuild - which Serverless Framework v4 uses natively to bundle .ts handlers - does
  // not emit `design:paramtypes` reflection metadata. Without an explicit token, Nest's
  // DI container would have nothing to resolve this constructor parameter with.
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
