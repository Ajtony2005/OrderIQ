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
import {
  createOrderSchema,
  orderResponseSchema,
  orderResponsesSchema,
  type CreateOrderInput,
  type OrderResponse,
} from "@orderiq/types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrdersService } from "./orders.service";

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
      return orderResponseSchema.parse(
        await this.ordersService.createOrder(req.user.userId, parsed),
      );
    } catch (error) {
      this.throwIfValidationError(error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Bejelentkezett felhasznalo rendeleseinek listazasa" })
  @ApiOkResponse({ description: "Sikeres rendeles lista" })
  async list(@Req() req: AuthenticatedRequest): Promise<OrderResponse[]> {
    return orderResponsesSchema.parse(await this.ordersService.listOrdersByUser(req.user.userId));
  }

  @Get(":id")
  @ApiOperation({ summary: "Rendeles lekerese azonosito alapjan" })
  @ApiOkResponse({ description: "Sikeres rendeles lekeres" })
  async byId(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<OrderResponse> {
    return orderResponseSchema.parse(
      await this.ordersService.getOrderByIdForUser(req.user.userId, id),
    );
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
