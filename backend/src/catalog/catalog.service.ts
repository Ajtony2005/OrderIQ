import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface CatalogProductResponse {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

export interface CatalogCategoryResponse {
  id: string;
  name: string;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(): Promise<CatalogProductResponse[]> {
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

  async listCategories(): Promise<CatalogCategoryResponse[]> {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });
  }
}
