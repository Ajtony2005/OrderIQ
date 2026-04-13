import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateOrderInput, OrderResponse, OrdersService } from "./orders.service";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  tipPercent: z.number().min(0).max(1).optional(),
  paymentMethod: z.enum(["cash", "card", "digital"]),
});

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
    role: "ADMIN" | "USER" | "KITCHEN";
  };
};

@ApiTags("orders")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard)
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Rendeles letrehozasa" })
  @ApiOkResponse({ description: "Sikeres rendeles letrehozas" })
  async create(@Req() req: AuthenticatedRequest, @Body() body: unknown): Promise<OrderResponse> {
    try {
      const parsed: CreateOrderInput = createOrderSchema.parse(body);
      return this.ordersService.createOrder(req.user.userId, parsed);
    } catch (error) {
      this.throwIfValidationError(error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Bejelentkezett felhasznalo rendeleseinek listazasa" })
  @ApiOkResponse({ description: "Sikeres rendeles lista" })
  async list(@Req() req: AuthenticatedRequest): Promise<OrderResponse[]> {
    return this.ordersService.listOrdersByUser(req.user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Rendeles lekerese azonosito alapjan" })
  @ApiOkResponse({ description: "Sikeres rendeles lekeres" })
  async byId(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<OrderResponse> {
    return this.ordersService.getOrderByIdForUser(req.user.userId, id);
  }

  private throwIfValidationError(error: unknown): void {
    if (
      typeof error === "object" &&
      error !== null &&
      "issues" in error &&
      Array.isArray((error as { issues: unknown[] }).issues)
    ) {
      throw new BadRequestException({
        message: "Hibas keres torzs.",
        details: (error as { issues: unknown[] }).issues,
      });
    }
  }
}
