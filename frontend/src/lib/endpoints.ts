import { apiRequest } from "./api";
import {
  adminProductPayloadSchema,
  adminProductResponseSchema,
  adminProductResponsesSchema,
  adminUserResponseSchema,
  adminUserResponsesSchema,
  catalogCategoriesSchema,
  catalogProductsSchema,
  createOrderSchema,
  orderResponseSchema,
  orderResponsesSchema,
  authResponseSchema,
  authUserSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
  type AdminProductPayload as SharedAdminProductPayload,
  type AdminProductResponse as SharedAdminProductResponse,
  type AdminUserResponse as SharedAdminUserResponse,
  type AuthResponse as SharedAuthResponse,
  type AuthUser as SharedAuthUser,
  type CatalogCategory as SharedCatalogCategory,
  type CatalogProduct as SharedCatalogProduct,
  type GoogleLoginInput,
  type LoginInput,
  type OrderResponse as SharedOrderResponse,
  type CreateOrderInput as SharedCreateOrderInput,
  type RegisterInput,
  type UpdateProfileInput,
} from "@orderiq/types";

export type LoginPayload = LoginInput;
export type RegisterPayload = RegisterInput;
export type GoogleAuthPayload = GoogleLoginInput;
export type UpdateProfilePayload = UpdateProfileInput;
export type OrderPayload = SharedCreateOrderInput;
export type Product = SharedCatalogProduct;
export type Category = SharedCatalogCategory;
export type AdminProductPayload = SharedAdminProductPayload;
export type AdminProductResponse = SharedAdminProductResponse;
export type AdminUserResponse = SharedAdminUserResponse;
export type OrderResponse = SharedOrderResponse;
export type AuthResponse = SharedAuthResponse;
export type AuthUser = SharedAuthUser;

export type CartItemPayload = OrderPayload["items"][number];

export const endpoints = {
  auth: {
    login: async (payload: LoginPayload) =>
      authResponseSchema.parse(
        await apiRequest<SharedAuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify(loginSchema.parse(payload)),
        }),
      ),
    register: async (payload: RegisterPayload) =>
      authResponseSchema.parse(
        await apiRequest<SharedAuthResponse>("/auth/register", {
          method: "POST",
          body: JSON.stringify(registerSchema.parse(payload)),
        }),
      ),
    google: async (payload: GoogleAuthPayload) =>
      authResponseSchema.parse(
        await apiRequest<SharedAuthResponse>("/auth/google", {
          method: "POST",
          body: JSON.stringify(googleLoginSchema.parse(payload)),
        }),
      ),
    me: async () => authUserSchema.parse(await apiRequest<SharedAuthUser>("/auth/me")),
    updateMe: async (payload: UpdateProfilePayload) =>
      authUserSchema.parse(
        await apiRequest<SharedAuthUser>("/auth/me", {
          method: "PATCH",
          body: JSON.stringify(updateProfileSchema.parse(payload)),
        }),
      ),
    logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  },
  catalog: {
    products: async () =>
      catalogProductsSchema.parse(await apiRequest<SharedCatalogProduct[]>("/products")),
    categories: async () =>
      catalogCategoriesSchema.parse(await apiRequest<SharedCatalogCategory[]>("/categories")),
  },
  orders: {
    create: async (payload: OrderPayload) =>
      orderResponseSchema.parse(
        await apiRequest<SharedOrderResponse>("/orders", {
          method: "POST",
          body: JSON.stringify(createOrderSchema.parse(payload)),
        }),
      ),
    list: async () =>
      orderResponsesSchema.parse(await apiRequest<SharedOrderResponse[]>("/orders")),
    byId: async (orderId: string) =>
      orderResponseSchema.parse(await apiRequest<SharedOrderResponse>(`/orders/${orderId}`)),
  },
  admin: {
    products: {
      list: async () =>
        adminProductResponsesSchema.parse(
          await apiRequest<SharedAdminProductResponse[]>("/admin/products"),
        ),
      create: async (payload: AdminProductPayload) =>
        adminProductResponseSchema.parse(
          await apiRequest<SharedAdminProductResponse>("/admin/products", {
            method: "POST",
            body: JSON.stringify(adminProductPayloadSchema.parse(payload)),
          }),
        ),
      update: async (id: string, payload: AdminProductPayload) =>
        adminProductResponseSchema.parse(
          await apiRequest<SharedAdminProductResponse>(`/admin/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(adminProductPayloadSchema.parse(payload)),
          }),
        ),
      remove: (id: string) => apiRequest<void>(`/admin/products/${id}`, { method: "DELETE" }),
    },
    users: {
      list: async () =>
        adminUserResponsesSchema.parse(await apiRequest<SharedAdminUserResponse[]>("/admin/users")),
      updateRole: async (id: string, role: string) =>
        adminUserResponseSchema.parse(
          await apiRequest<SharedAdminUserResponse>(`/admin/users/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ role }),
          }),
        ),
    },
    orders: {
      list: async () =>
        orderResponsesSchema.parse(await apiRequest<SharedOrderResponse[]>("/admin/orders")),
      byId: async (orderId: string) =>
        orderResponseSchema.parse(
          await apiRequest<SharedOrderResponse>(`/admin/orders/${orderId}`),
        ),
    },
  },
};
