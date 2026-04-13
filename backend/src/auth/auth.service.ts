import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { type LoginInput, type RegisterInput } from "@orderiq/types";
import { JwtService } from "@nestjs/jwt";
import { AuthProvider, Role, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { PrismaService } from "../prisma/prisma.service";

type SafeUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  providers: AuthProvider[];
};

type AuthResult = {
  accessToken: string;
  user: SafeUser;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
      include: { identities: true },
    });

    const passwordHash = await bcrypt.hash(input.password, 12);

    if (existingUser) {
      const hasPasswordProvider = existingUser.identities.some(
        (identity) => identity.provider === AuthProvider.PASSWORD,
      );

      if (hasPasswordProvider || existingUser.passwordHash) {
        throw new ConflictException("Ezzel az email címmel már létezik regisztráció.");
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          passwordHash,
          identities: {
            create: {
              provider: AuthProvider.PASSWORD,
              providerUserId: email,
            },
          },
        },
        include: { identities: true },
      });

      return this.buildAuthResult(updatedUser);
    }

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        name: input.name,
        passwordHash,
        role: Role.USER,
        identities: {
          create: {
            provider: AuthProvider.PASSWORD,
            providerUserId: email,
          },
        },
      },
      include: { identities: true },
    });

    return this.buildAuthResult(createdUser);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { identities: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Hibás email vagy jelszó.");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Hibás email vagy jelszó.");
    }

    const hasPasswordProvider = user.identities.some(
      (identity) => identity.provider === AuthProvider.PASSWORD,
    );
    if (!hasPasswordProvider) {
      await this.prisma.authIdentity.create({
        data: {
          provider: AuthProvider.PASSWORD,
          providerUserId: email,
          userId: user.id,
        },
      });
    }

    const refreshedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { identities: true },
    });

    if (!refreshedUser) {
      throw new InternalServerErrorException("A felhasználó nem található a bejelentkezés után.");
    }

    return this.buildAuthResult(refreshedUser);
  }

  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    let ticket;
    try {
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      });
    } catch {
      throw new UnauthorizedException("Érvénytelen Google token.");
    }

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException("Érvénytelen Google token.");
    }

    const email = payload.email.toLowerCase();
    const googleSub = payload.sub;

    const existingGoogleIdentity = await this.prisma.authIdentity.findUnique({
      where: {
        provider_providerUserId: {
          provider: AuthProvider.GOOGLE,
          providerUserId: googleSub,
        },
      },
      include: {
        user: {
          include: { identities: true },
        },
      },
    });

    if (existingGoogleIdentity) {
      return this.buildAuthResult(existingGoogleIdentity.user);
    }

    const existingEmailUser = await this.prisma.user.findUnique({
      where: { email },
      include: { identities: true },
    });

    if (existingEmailUser) {
      const hasGoogleProvider = existingEmailUser.identities.some(
        (identity) => identity.provider === AuthProvider.GOOGLE,
      );

      if (!hasGoogleProvider) {
        await this.prisma.authIdentity.create({
          data: {
            provider: AuthProvider.GOOGLE,
            providerUserId: googleSub,
            userId: existingEmailUser.id,
          },
        });
      }

      const linkedUser = await this.prisma.user.findUnique({
        where: { id: existingEmailUser.id },
        include: { identities: true },
      });

      if (!linkedUser) {
        throw new InternalServerErrorException(
          "A felhasználó nem található a Google kapcsolás után.",
        );
      }

      return this.buildAuthResult(linkedUser);
    }

    const createdUser = await this.prisma.user.create({
      data: {
        email,
        name: payload.name?.trim() || email.split("@")[0] || "User",
        role: Role.USER,
        identities: {
          create: {
            provider: AuthProvider.GOOGLE,
            providerUserId: googleSub,
          },
        },
      },
      include: { identities: true },
    });

    return this.buildAuthResult(createdUser);
  }

  private buildAuthResult(
    user: User & { identities: Array<{ provider: AuthProvider }> },
  ): AuthResult {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        providers: user.identities.map((identity) => identity.provider),
      },
    };
  }
}
