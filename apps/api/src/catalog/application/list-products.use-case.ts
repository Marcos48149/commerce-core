import { Injectable } from '@nestjs/common';
import { CatalogRepository, ProductFilter, PaginatedProducts } from '../domain/catalog.repository';

export interface ListProductsInput {
  storeId: string;
  filter: ProductFilter;
}

@Injectable()
export class ListProductsUseCase {
  constructor(
    private readonly catalogRepository: CatalogRepository,
  ) {}

  async execute(input: ListProductsInput): Promise<PaginatedProducts> {
    return this.catalogRepository.findProductsByStore(input.storeId, input.filter);
  }
}
