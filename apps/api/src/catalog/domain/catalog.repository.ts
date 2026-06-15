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

export interface CatalogRepository {
  findProductById(id: string, storeId: string): Promise<Product | null>;
  findProductsByStore(storeId: string, filter: ProductFilter): Promise<PaginatedProducts>;
  findProductBySlug(storeId: string, slug: string): Promise<Product | null>;
  saveProduct(product: Product): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  deleteProduct(id: string, storeId: string): Promise<void>;

  findVariantById(id: string, storeId: string): Promise<Variant | null>;
  findVariantsByProduct(productId: string, storeId: string): Promise<Variant[]>;
  findVariantBySku(storeId: string, sku: string): Promise<Variant | null>;
  saveVariant(variant: Variant): Promise<void>;
  updateVariant(variant: Variant): Promise<void>;
  deleteVariant(id: string, storeId: string): Promise<void>;

  findCategoryById(id: string, storeId: string): Promise<Category | null>;
  findCategoriesByStore(storeId: string): Promise<Category[]>;
  findCategoryBySlug(storeId: string, slug: string): Promise<Category | null>;
  saveCategory(category: Category): Promise<void>;
  updateCategory(category: Category): Promise<void>;
  deleteCategory(id: string, storeId: string): Promise<void>;

  findCollectionById(id: string, storeId: string): Promise<Collection | null>;
  findCollectionsByStore(storeId: string): Promise<Collection[]>;
  findCollectionBySlug(storeId: string, slug: string): Promise<Collection | null>;
  saveCollection(collection: Collection): Promise<void>;
  updateCollection(collection: Collection): Promise<void>;
  deleteCollection(id: string, storeId: string): Promise<void>;
}
