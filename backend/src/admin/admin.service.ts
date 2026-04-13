import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { OrderResponse, OrdersService } from "../orders/orders.service";

export interface AdminProductPayload {
  name: string;
  price: number;
  category: string;
  image?: string;
}

export interface AdminProductResponse {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

export interface UpdateUserRolePayload {
  role: "admin" | "staff";
}

function toFrontendRole(role: Role): "admin" | "staff" {
  return role === Role.ADMIN ? "admin" : "staff";
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

  async listProducts(): Promise<AdminProductResponse[]> {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category.name,
      image: product.image ?? "",
    }));
  }

  async createProduct(payload: AdminProductPayload): Promise<AdminProductResponse> {
    const category = await this.getOrCreateCategory(payload.category);

    const createdProduct = await this.prisma.product.create({
      data: {
        name: payload.name.trim(),
        price: payload.price,
        image: payload.image?.trim() || null,
        categoryId: category.id,
      },
      include: { category: true },
    });

    return {
      id: createdProduct.id,
      name: createdProduct.name,
      price: createdProduct.price,
      category: createdProduct.category.name,
      image: createdProduct.image ?? "",
    };
  }

  async updateProduct(id: string, payload: AdminProductPayload): Promise<AdminProductResponse> {
    const category = await this.getOrCreateCategory(payload.category);

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          name: payload.name.trim(),
          price: payload.price,
          image: payload.image?.trim() || null,
          categoryId: category.id,
        },
        include: { category: true },
      });

      return {
        id: updatedProduct.id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category.name,
        image: updatedProduct.image ?? "",
      };
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw new NotFoundException("A termek nem talalhato.");
      }

      throw error;
    }
  }

  async removeProduct(id: string): Promise<void> {
    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw new NotFoundException("A termek nem talalhato.");
      }

      throw error;
    }
  }

  async listUsers(): Promise<AdminUserResponse[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: toFrontendRole(user.role),
    }));
  }

  async updateUserRole(id: string, payload: UpdateUserRolePayload): Promise<AdminUserResponse> {
    const targetRole = payload.role === "admin" ? Role.ADMIN : Role.USER;

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          role: targetRole,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: toFrontendRole(updatedUser.role),
      };
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw new NotFoundException("A felhasznalo nem talalhato.");
      }

      throw error;
    }
  }

  async listOrders(): Promise<OrderResponse[]> {
    return this.ordersService.listAllOrders();
  }

  async getOrderById(id: string): Promise<OrderResponse> {
    return this.ordersService.getOrderByIdForAdmin(id);
  }

  private async getOrCreateCategory(name: string) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      throw new BadRequestException("A kategoria nev kotelezo.");
    }

    const existing = await this.prisma.category.findUnique({
      where: { name: normalizedName },
      select: {
        id: true,
        name: true,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.category.create({
      data: {
        name: normalizedName,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  private isRecordNotFound(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
  }
}
