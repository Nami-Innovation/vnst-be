import { INestApplication, ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { AppModule } from "@modules/app/app.module";
import appSession from "./session.config";
import { origin } from "@utils/constant/origin";
import compression from "compression";
import cookieParser from "cookie-parser";
import { PaginationQueryPipeTransform } from "src/pipe/transform.pipe";

export async function appConfig(
  app: INestApplication,
): Promise<INestApplication> {
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      enableDebugMessages: true,
      disableErrorMessages: false,
    }),
    new PaginationQueryPipeTransform(),
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true, limit: "10mb" }));
  app.enableCors({
    origin,
    credentials: true,
  });
  app.use(appSession);
  app.use(compression());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  return app;
}
