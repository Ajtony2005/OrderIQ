import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { registerSchema } from "@orderiq/types";
import { Strategy } from "passport-local";

@Injectable()
export class LocalRegisterStrategy extends PassportStrategy(Strategy, "local-register") {
  constructor() {
    super({
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
      session: false,
    });
  }

  async validate(req: { body?: Record<string, unknown> }, email: string, password: string) {
    const parsed = registerSchema.safeParse({
      email,
      password,
      name: req.body?.name,
    });

    if (!parsed.success) {
      throw new UnauthorizedException("Hibás regisztrációs adatok.");
    }

    return parsed.data;
  }
}
