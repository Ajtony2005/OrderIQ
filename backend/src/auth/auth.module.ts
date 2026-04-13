import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalLoginGuard } from "./guards/local-login.guard";
import { LocalRegisterGuard } from "./guards/local-register.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalLoginStrategy } from "./strategies/local-login.strategy";
import { LocalRegisterStrategy } from "./strategies/local-register.strategy";

const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "dev-secret-change-me",
      signOptions: {
        expiresIn: jwtExpiresIn && /^\d+$/.test(jwtExpiresIn) ? Number(jwtExpiresIn) : "7d",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalLoginStrategy,
    LocalRegisterStrategy,
    JwtAuthGuard,
    LocalLoginGuard,
    LocalRegisterGuard,
  ],
})
export class AuthModule {}
