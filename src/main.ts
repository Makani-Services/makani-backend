import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions: CorsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  };
  app.enableCors(corsOptions);
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '100mb' }));
  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  //BEGIN: slow API detection
  // app.use((req, res, next) => {
  //   const start = Date.now();
  //   console.log(`🚀 STARTED:             API: ${req.method} ${req.url} `);
  //   res.on('finish', () => {
  //     const duration = Date.now() - start;
  //     console.log(
  //       `🚀 FINISHED: ${duration}ms            API: ${req.method} ${req.url} `,
  //     );
  //     if (duration > 1000) {
  //       console.error(
  //         `********* SLOW API DETECTED:  *********    ${duration}ms              API: ${req.method} ${req.url} `,
  //       );
  //     }
  //   });
  //   next();
  // });
  //END: slow API detection

  await app.listen(5000);
}
bootstrap();
