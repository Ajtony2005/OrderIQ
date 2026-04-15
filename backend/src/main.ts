import "reflect-metadata";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

const envCandidates = [resolve(__dirname, "../.env"), resolve(process.cwd(), ".env")];

for (const envPath of envCandidates) {
  if (existsSync(envPath)) {
    loadEnv({ path: envPath, override: false });
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const configuredCorsOrigins = process.env.CORS_ORIGINS?.trim();
  const corsOrigins = configuredCorsOrigins
    ? configuredCorsOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : ["http://localhost:5177", "http://127.0.0.1:5177"];

  app.enableCors({
    origin: corsOrigins.includes("*") ? true : corsOrigins,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

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
    SwaggerModule.setup("docs", app, swaggerDocument, { useGlobalPrefix: true });
  }

  await app.listen(port, "0.0.0.0");
}

void bootstrap();
