import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { googleLoginSchema, type GoogleLoginInput, type RegisterInput } from "@orderiq/types";
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LocalLoginGuard } from "./guards/local-login.guard";
import { LocalRegisterGuard } from "./guards/local-register.guard";

const authResponseOpenApiSchema = {
  type: "object",
  required: ["accessToken", "user"],
  properties: {
    accessToken: { type: "string" },
    user: {
      type: "object",
      required: ["id", "email", "name", "role", "providers"],
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string", format: "email" },
        name: { type: "string" },
        role: { type: "string", enum: ["ADMIN", "USER", "KITCHEN"] },
        providers: {
          type: "array",
          items: { type: "string", enum: ["PASSWORD", "GOOGLE"] },
        },
      },
    },
  },
};

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @UseGuards(LocalRegisterGuard)
  @ApiOperation({ summary: "Regisztráció email + jelszó alapon" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["email", "name", "password"],
      properties: {
        email: { type: "string", format: "email" },
        name: { type: "string" },
        password: { type: "string", minLength: 8 },
      },
    },
  })
  @ApiCreatedResponse({
    description: "Sikeres regisztráció",
    schema: authResponseOpenApiSchema,
  })
  async register(@Req() req: { user: RegisterInput }) {
    return this.authService.register(req.user);
  }

  @Post("login")
  @UseGuards(LocalLoginGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Bejelentkezés email + jelszó alapon" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" },
      },
    },
  })
  @ApiOkResponse({
    description: "Sikeres bejelentkezés",
    schema: authResponseOpenApiSchema,
  })
  async login(@Req() req: { user: unknown }) {
    return req.user;
  }

  @Post("google")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Google ID Token alapú bejelentkezés" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["idToken"],
      properties: {
        idToken: { type: "string" },
      },
    },
  })
  @ApiOkResponse({
    description: "Sikeres Google bejelentkezés",
    schema: authResponseOpenApiSchema,
  })
  async googleLogin(@Body() body: unknown) {
    try {
      const parsed: GoogleLoginInput = googleLoginSchema.parse(body);
      return await this.authService.loginWithGoogle(parsed.idToken);
    } catch (error) {
      this.throwIfValidationError(error);
      throw error;
    }
  }

  private throwIfValidationError(error: unknown): void {
    if (
      typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues: unknown[] }).issues)
    ) {
      throw new BadRequestException({
        message: "Hibás kérés törzs.",
        details: (error as { issues: unknown[] }).issues,
      });
    }
  }
}
