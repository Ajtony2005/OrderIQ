import { Injectable } from "@nestjs/common";
import {
  type CatalogCategory as SharedCatalogCategory,
  type CatalogProduct as SharedCatalogProduct,
} from "@orderiq/types";
import { PrismaService } from "../prisma/prisma.service";

export type CatalogProductResponse = SharedCatalogProduct;
export type CatalogCategoryResponse = SharedCatalogCategory;

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
