import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.setGlobalPrefix("api/v1");
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const isDevelopment = process.env.APP_ENV === "development";

  if (isDevelopment) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("OrderIQ API")
      .setDescription("OrderIQ backend API documentation")
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
        },
        "access-token",
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, swaggerDocument);
  }

  await app.listen(port, "0.0.0.0");
}

void bootstrap();
