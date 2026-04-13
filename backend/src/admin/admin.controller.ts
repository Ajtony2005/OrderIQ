import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  AdminProductPayload,
  AdminProductResponse,
  AdminService,
  AdminUserResponse,
  UpdateUserRolePayload,
} from "./admin.service";
import { OrderResponse } from "../orders/orders.service";

const adminProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: z.number().int().nonnegative(),
  category: z.string().trim().min(1).max(80),
  image: z.string().trim().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(["admin", "staff"]),
});

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
    role: "ADMIN" | "USER" | "KITCHEN";
  };
};

@ApiTags("admin")
@ApiBearerAuth("access-token")
@UseGuards(JwtAuthGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("products")
  @ApiOperation({ summary: "Admin termeklista" })
  @ApiOkResponse({ description: "Sikeres termeklista" })
  async listProducts(@Req() req: AuthenticatedRequest): Promise<AdminProductResponse[]> {
    this.ensureAdmin(req.user.role);
    return this.adminService.listProducts();
  }

  @Post("products")
  @ApiOperation({ summary: "Admin termek letrehozasa" })
  @ApiOkResponse({ description: "Sikeres termek letrehozas" })
  async createProduct(
    @Req() req: AuthenticatedRequest,
    @Body() body: unknown,
  ): Promise<AdminProductResponse> {
    this.ensureAdmin(req.user.role);

    try {
      const parsed: AdminProductPayload = adminProductSchema.parse(body);
      return this.adminService.createProduct(parsed);
    } catch (error) {
      this.throwIfValidationError(error);
      throw error;
    }
  }

  @Put("products/:id")
  @ApiOperation({ summary: "Admin termek frissitese" })
  @ApiOkResponse({ description: "Sikeres termek frissites" })
  async updateProduct(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<AdminProductResponse> {
    this.ensureAdmin(req.user.role);

    try {
      const parsed: AdminProductPayload = adminProductSchema.parse(body);
      return this.adminService.updateProduct(id, parsed);
    } catch (error) {
      this.throwIfValidationError(error);
      throw error;
    }
  }

  @Delete("products/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Admin termek torlese" })
  async removeProduct(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<void> {
    this.ensureAdmin(req.user.role);
    await this.adminService.removeProduct(id);
  }

  @Get("users")
  @ApiOperation({ summary: "Admin felhasznalo lista" })
  @ApiOkResponse({ description: "Sikeres felhasznalo lista" })
  async listUsers(@Req() req: AuthenticatedRequest): Promise<AdminUserResponse[]> {
    this.ensureAdmin(req.user.role);
    return this.adminService.listUsers();
  }

  @Patch("users/:id")
  @ApiOperation({ summary: "Felhasznalo szerepkor frissitese" })
  @ApiOkResponse({ description: "Sikeres szerepkor frissites" })
  async updateUserRole(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ): Promise<AdminUserResponse> {
    this.ensureAdmin(req.user.role);

    try {
      const parsed: UpdateUserRolePayload = updateUserRoleSchema.parse(body);
      return this.adminService.updateUserRole(id, parsed);
    } catch (error) {
      this.throwIfValidationError(error);
      throw error;
    }
  }

  @Get("orders")
  @ApiOperation({ summary: "Admin rendeles lista" })
  @ApiOkResponse({ description: "Sikeres rendeles lista" })
  async listOrders(@Req() req: AuthenticatedRequest): Promise<OrderResponse[]> {
    this.ensureAdmin(req.user.role);
    return this.adminService.listOrders();
  }

  @Get("orders/:id")
  @ApiOperation({ summary: "Admin rendeles lekerese" })
  @ApiOkResponse({ description: "Sikeres rendeles lekeres" })
  async getOrderById(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
  ): Promise<OrderResponse> {
    this.ensureAdmin(req.user.role);
    return this.adminService.getOrderById(id);
  }

  private ensureAdmin(role: "ADMIN" | "USER" | "KITCHEN"): void {
    if (role !== "ADMIN") {
      throw new ForbiddenException("Az endpoint csak admin jogosultsaggal erheto el.");
    }
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
