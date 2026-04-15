import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  authResponseSchema,
  authUserSchema,
  googleLoginSchema,
  updateProfileSchema,
  type GoogleLoginInput,
  type RegisterInput,
  type UpdateProfileInput,
} from "@orderiq/types";
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalLoginGuard } from "./guards/local-login.guard";
import { LocalRegisterGuard } from "./guards/local-register.guard";

const authResponseOpenApiSchema = {
  type: "object",
  required: ["accessToken", "user"],
  properties: {
    accessToken: { type: "string" },
    user: {
      type: "object",
      required: ["id", "email", "name", "role", "providers", "createdAt", "updatedAt"],
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string", format: "email" },
        name: { type: "string" },
        role: { type: "string", enum: ["ADMIN", "USER", "KITCHEN"] },
        providers: {
          type: "array",
          items: { type: "string", enum: ["PASSWORD", "GOOGLE"] },
        },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  },
};

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
    role: "ADMIN" | "USER" | "KITCHEN";
  };
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
    return authResponseSchema.parse(await this.authService.register(req.user));
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
    return authResponseSchema.parse(req.user);
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
      return authResponseSchema.parse(await this.authService.loginWithGoogle(parsed.idToken));
    } catch (error) {
      this.throwIfValidationError(error);
      throw error;
    }
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Kijelentkezes" })
  async logout(): Promise<void> {
    return;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Bejelentkezett felhasználó adatainak lekérése" })
  @ApiOkResponse({
    description: "Sikeres profil lekérés",
    schema: authResponseOpenApiSchema.properties.user,
  })
  async me(@Req() req: AuthenticatedRequest) {
    return authUserSchema.parse(await this.authService.getProfile(req.user.userId));
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Profiladatok frissítése (email és jelszó kivételével)" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", minLength: 2, maxLength: 100 },
      },
    },
  })
  @ApiOkResponse({
    description: "Sikeres profil frissítés",
    schema: authResponseOpenApiSchema.properties.user,
  })
  async updateMe(@Req() req: AuthenticatedRequest, @Body() body: unknown) {
    try {
      const parsed: UpdateProfileInput = updateProfileSchema.parse(body);
      return authUserSchema.parse(await this.authService.updateProfile(req.user.userId, parsed));
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
