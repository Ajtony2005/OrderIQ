import { apiRequest } from "./api";

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "KITCHEN";
  providers: Array<"PASSWORD" | "GOOGLE">;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface GoogleAuthPayload {
  idToken: string;
}

export interface UpdateProfilePayload {
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItemPayload {
  productId: string;
  quantity: number;
}

export interface OrderPayload {
  items: CartItemPayload[];
  tipPercent?: number;
  paymentMethod: "cash" | "card" | "digital";
}

export interface OrderResponse {
  id: string;
  total: number;
  createdAt: string;
}

export interface AdminProductPayload {
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const endpoints = {
  auth: {
    login: (payload: LoginPayload) =>
      apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    register: (payload: RegisterPayload) =>
      apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    google: (payload: GoogleAuthPayload) =>
      apiRequest<AuthResponse>("/auth/google", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: () => apiRequest<AuthUser>("/auth/me"),
    updateMe: (payload: UpdateProfilePayload) =>
      apiRequest<AuthUser>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    logout: () => apiRequest<void>("/auth/logout", { method: "POST" }),
  },
  catalog: {
    products: () => apiRequest<Product[]>("/products"),
    categories: () => apiRequest<Category[]>("/categories"),
  },
  orders: {
    create: (payload: OrderPayload) =>
      apiRequest<OrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    list: () => apiRequest<OrderResponse[]>("/orders"),
    byId: (orderId: string) => apiRequest<OrderResponse>(`/orders/${orderId}`),
  },
  admin: {
    products: {
      list: () => apiRequest<Product[]>("/admin/products"),
      create: (payload: AdminProductPayload) =>
        apiRequest<Product>("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      update: (id: string, payload: AdminProductPayload) =>
        apiRequest<Product>(`/admin/products/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
      remove: (id: string) => apiRequest<void>(`/admin/products/${id}`, { method: "DELETE" }),
    },
    users: {
      list: () => apiRequest<AdminUserResponse[]>("/admin/users"),
      updateRole: (id: string, role: string) =>
        apiRequest<AdminUserResponse>(`/admin/users/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ role }),
        }),
    },
    orders: {
      list: () => apiRequest<OrderResponse[]>("/admin/orders"),
      byId: (orderId: string) => apiRequest<OrderResponse>(`/admin/orders/${orderId}`),
    },
  },
};
