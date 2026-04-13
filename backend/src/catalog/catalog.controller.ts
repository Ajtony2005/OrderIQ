import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CatalogCategoryResponse, CatalogProductResponse, CatalogService } from "./catalog.service";

@ApiTags("catalog")
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get("products")
  @ApiOperation({ summary: "Termeklista lekerese" })
  @ApiOkResponse({ description: "Termekek sikeresen lekerve" })
  async products(): Promise<CatalogProductResponse[]> {
    return this.catalogService.listProducts();
  }

  @Get("categories")
  @ApiOperation({ summary: "Kategoria lista lekerese" })
  @ApiOkResponse({ description: "Kategoriak sikeresen lekerve" })
  async categories(): Promise<CatalogCategoryResponse[]> {
    return this.catalogService.listCategories();
  }
}
