import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { loginSchema } from "@orderiq/types";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalLoginStrategy extends PassportStrategy(Strategy, "local-login") {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: "email",
      passwordField: "password",
      session: false,
    });
  }

  async validate(email: string, password: string) {
    const parsed = loginSchema.parse({ email, password });
    return this.authService.login(parsed);
  }
}
