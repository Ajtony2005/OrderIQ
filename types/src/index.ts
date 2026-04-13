export type Id = string;

export {
  googleLoginSchema,
  loginSchema,
  registerSchema,
  authUserSchema,
  authResponseSchema,
} from "./schemas/auth.js";

export type {
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  AuthUser,
  AuthResponse,
} from "./schemas/auth.js";
