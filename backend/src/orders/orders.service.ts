import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PaymentMethod } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  tipPercent?: number;
  paymentMethod: "cash" | "card" | "digital";
}

export interface OrderResponse {
  id: string;
  total: number;
  createdAt: string;
}

const paymentMethodMap: Record<CreateOrderInput["paymentMethod"], PaymentMethod> = {
  cash: PaymentMethod.CASH,
  card: PaymentMethod.CARD,
  digital: PaymentMethod.CARD,
};

function toOrderResponse(order: { id: string; total: number; createdAt: Date }): OrderResponse {
  return {
    id: order.id,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
  };
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, input: CreateOrderInput): Promise<OrderResponse> {
    const productIds = Array.from(new Set(input.items.map((item) => item.productId)));

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        price: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException("Egy vagy tobb termek nem talalhato.");
    }

    const priceByProductId = new Map(products.map((product) => [product.id, product.price]));

    const subtotal = input.items.reduce((sum, item) => {
      const unitPrice = priceByProductId.get(item.productId);
      if (unitPrice === undefined) {
        throw new BadRequestException("Ervenytelen termek azonosito.");
      }

      return sum + unitPrice * item.quantity;
    }, 0);

    const tipPercent = input.tipPercent ?? 0;
    const total = Math.max(0, Math.round(subtotal * (1 + tipPercent)));

    const createdOrder = await this.prisma.order.create({
      data: {
        total,
        tipPercent,
        paymentMethod: paymentMethodMap[input.paymentMethod],
        userId,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    return toOrderResponse(createdOrder);
  }

  async listOrdersByUser(userId: string): Promise<OrderResponse[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    return orders.map(toOrderResponse);
  }

  async getOrderByIdForUser(userId: string, orderId: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    if (!order) {
      throw new NotFoundException("A rendeles nem talalhato.");
    }

    return toOrderResponse(order);
  }

  async listAllOrders(): Promise<OrderResponse[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    return orders.map(toOrderResponse);
  }

  async getOrderByIdForAdmin(orderId: string): Promise<OrderResponse> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        total: true,
        createdAt: true,
      },
    });

    if (!order) {
      throw new NotFoundException("A rendeles nem talalhato.");
    }

    return toOrderResponse(order);
  }
}
