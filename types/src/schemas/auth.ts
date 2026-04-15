import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(2),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const googleLoginSchema = z.object({
  idToken: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const catalogCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

export const catalogProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  category: z.string().min(1),
  image: z.string(),
});

export const createOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1),
  tipPercent: z.number().min(0).max(1).optional(),
  paymentMethod: z.enum(["cash", "card", "digital"]),
});

export const orderResponseSchema = z.object({
  id: z.string().uuid(),
  total: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const adminProductPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.number().int().nonnegative(),
  category: z.string().trim().min(1).max(80),
  image: z.string().trim().optional(),
});

export const adminProductResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  category: z.string().min(1),
  image: z.string(),
});

export const adminUserResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "staff"]),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "staff"]),
});

export const authUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "USER", "KITCHEN"]),
  providers: z.array(z.enum(["PASSWORD", "GOOGLE"])),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const authResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: authUserSchema,
});

export const catalogCategoriesSchema = z.array(catalogCategorySchema);
export const catalogProductsSchema = z.array(catalogProductSchema);
export const orderResponsesSchema = z.array(orderResponseSchema);
export const adminProductResponsesSchema = z.array(adminProductResponseSchema);
export const adminUserResponsesSchema = z.array(adminUserResponseSchema);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CatalogCategory = z.infer<typeof catalogCategorySchema>;
export type CatalogProduct = z.infer<typeof catalogProductSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderResponse = z.infer<typeof orderResponseSchema>;
export type AdminProductPayload = z.infer<typeof adminProductPayloadSchema>;
export type AdminProductResponse = z.infer<typeof adminProductResponseSchema>;
export type AdminUserResponse = z.infer<typeof adminUserResponseSchema>;
export type UpdateUserRolePayload = z.infer<typeof updateUserRoleSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
