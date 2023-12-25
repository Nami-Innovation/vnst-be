import { DocumentBuilder } from "@nestjs/swagger";

export const configSwagger = new DocumentBuilder()
  .setTitle("Vnst")
  .setDescription("Vnst v1")
  .setVersion("1.0")
  .addTag("VNST")
  .addBearerAuth(
    {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      name: "JWT",
      description: "Enter JWT token",
      in: "header",
    },
    "JWT-auth", // This name here is important for matching up with @ApiBearerAuth() in your controller!
  )
  .build();
