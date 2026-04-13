import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class LocalRegisterGuard extends AuthGuard("local-register") {}
