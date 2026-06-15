import { Product } from './product.entity';
import { Variant } from './variant.entity';
import { Category } from './category.entity';
import { Collection } from './collection.entity';

export interface ProductFilter {
  search?: string;
  isActive?: boolean;
  categoryId?: string;
  collectionId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class CatalogRepository {
  abstract findProductById(id: string, storeId: string): Promise<Product | null>;
  abstract findProductsByStore(storeId: string, filter: ProductFilter): Promise<PaginatedProducts>;
  abstract findProductBySlug(storeId: string, slug: string): Promise<Product | null>;
  abstract saveProduct(product: Product): Promise<void>;
  abstract updateProduct(product: Product): Promise<void>;
  abstract deleteProduct(id: string, storeId: string): Promise<void>;

  abstract findVariantById(id: string, storeId: string): Promise<Variant | null>;
  abstract findVariantsByProduct(productId: string, storeId: string): Promise<Variant[]>;
  abstract findVariantBySku(storeId: string, sku: string): Promise<Variant | null>;
  abstract saveVariant(variant: Variant): Promise<void>;
  abstract updateVariant(variant: Variant): Promise<void>;
  abstract deleteVariant(id: string, storeId: string): Promise<void>;

  abstract findCategoryById(id: string, storeId: string): Promise<Category | null>;
  abstract findCategoriesByStore(storeId: string): Promise<Category[]>;
  abstract findCategoryBySlug(storeId: string, slug: string): Promise<Category | null>;
  abstract saveCategory(category: Category): Promise<void>;
  abstract updateCategory(category: Category): Promise<void>;
  abstract deleteCategory(id: string, storeId: string): Promise<void>;

  abstract findCollectionById(id: string, storeId: string): Promise<Collection | null>;
  abstract findCollectionsByStore(storeId: string): Promise<Collection[]>;
  abstract findCollectionBySlug(storeId: string, slug: string): Promise<Collection | null>;
  abstract saveCollection(collection: Collection): Promise<void>;
  abstract updateCollection(collection: Collection): Promise<void>;
  abstract deleteCollection(id: string, storeId: string): Promise<void>;
}
