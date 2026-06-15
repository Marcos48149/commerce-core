import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CatalogRepository, ProductFilter, PaginatedProducts } from '../domain/catalog.repository';
import { Product } from '../domain/product.entity';
import { Variant } from '../domain/variant.entity';
import { Category } from '../domain/category.entity';
import { Collection } from '../domain/collection.entity';
import { Money, Slug, Sku, Weight, Dimensions } from '../domain/value-objects';

@Injectable()
export class PrismaCatalogRepository implements CatalogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private productWhere(storeId: string) {
    return { storeId, deletedAt: null };
  }

  private variantWhere(storeId: string) {
    return { storeId, deletedAt: null };
  }

  private categoryWhere(storeId: string) {
    return { storeId, deletedAt: null };
  }

  private collectionWhere(storeId: string) {
    return { storeId, deletedAt: null };
  }

  private toProduct(row: any): Product {
    return Product.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      name: row.name,
      slug: Slug.create(row.slug),
      description: row.description,
      metadata: row.metadata ?? {},
    });
  }

  private toVariant(row: any): Variant {
    const dims = row.dimensions as { length?: number; width?: number; height?: number; unit?: 'cm' | 'in' } | null;
    return Variant.create({
      id: row.id,
      productId: row.productId,
      tenantId: row.tenantId,
      storeId: row.storeId,
      sku: Sku.create(row.sku),
      name: row.name,
      price: Money.create(Number(row.price), row.currency),
      compareAtPrice: row.compareAtPrice != null ? Money.create(Number(row.compareAtPrice), row.currency) : null,
      costPrice: row.costPrice != null ? Money.create(Number(row.costPrice), row.currency) : null,
      weight: row.weight != null ? Weight.create(Number(row.weight), row.weightUnit) : null,
      dimensions: dims ? Dimensions.create(dims.length!, dims.width!, dims.height!, dims.unit!) : null,
      barcode: row.barcode,
      sortOrder: row.sortOrder,
    });
  }

  private toCategory(row: any): Category {
    return Category.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      name: row.name,
      slug: Slug.create(row.slug),
      description: row.description,
      imageUrl: row.imageUrl,
      parentId: row.parentId,
      sortOrder: row.sortOrder,
    });
  }

  private toCollection(row: any): Collection {
    return Collection.create({
      id: row.id,
      tenantId: row.tenantId,
      storeId: row.storeId,
      name: row.name,
      slug: Slug.create(row.slug),
      description: row.description,
      imageUrl: row.imageUrl,
      sortOrder: row.sortOrder,
    });
  }

  // ─── Product ────────────────────────────────────────────────────────────────

  async findProductById(id: string, storeId: string): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({
      where: { id, ...this.productWhere(storeId) },
    });
    return row ? this.toProduct(row) : null;
  }

  async findProductsByStore(storeId: string, filter: ProductFilter): Promise<PaginatedProducts> {
    const where: Prisma.ProductWhereInput = { ...this.productWhere(storeId) };

    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.categoryId) {
      where.categories = { some: { categoryId: filter.categoryId } };
    }
    if (filter.collectionId) {
      where.collections = { some: { collectionId: filter.collectionId } };
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (filter.sortBy) {
      orderBy[filter.sortBy as keyof Prisma.ProductOrderByWithRelationInput] = filter.sortOrder ?? 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({ where, skip, take: limit, orderBy }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toProduct(r)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findProductBySlug(storeId: string, slug: string): Promise<Product | null> {
    const row = await this.prisma.product.findFirst({
      where: { slug, ...this.productWhere(storeId) },
    });
    return row ? this.toProduct(row) : null;
  }

  async saveProduct(product: Product): Promise<void> {
    await this.prisma.product.create({
      data: {
        id: product.id,
        tenantId: product.tenantId,
        storeId: product.storeId,
        name: product.name,
        slug: product.slug.value,
        description: product.description,
        isActive: product.isActive,
        metadata: product.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async updateProduct(product: Product): Promise<void> {
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        name: product.name,
        slug: product.slug.value,
        description: product.description,
        isActive: product.isActive,
        metadata: product.metadata as Prisma.InputJsonValue,
      },
    });
  }

  async deleteProduct(id: string, storeId: string): Promise<void> {
    await this.prisma.product.updateMany({
      where: { id, ...this.productWhere(storeId) },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Variant ────────────────────────────────────────────────────────────────

  async findVariantById(id: string, storeId: string): Promise<Variant | null> {
    const row = await this.prisma.variant.findFirst({
      where: { id, ...this.variantWhere(storeId) },
    });
    return row ? this.toVariant(row) : null;
  }

  async findVariantsByProduct(productId: string, storeId: string): Promise<Variant[]> {
    const rows = await this.prisma.variant.findMany({
      where: { productId, ...this.variantWhere(storeId) },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => this.toVariant(r));
  }

  async findVariantBySku(storeId: string, sku: string): Promise<Variant | null> {
    const row = await this.prisma.variant.findFirst({
      where: { sku, ...this.variantWhere(storeId) },
    });
    return row ? this.toVariant(row) : null;
  }

  async saveVariant(variant: Variant): Promise<void> {
    await this.prisma.variant.create({
      data: {
        id: variant.id,
        productId: variant.productId,
        tenantId: variant.tenantId,
        storeId: variant.storeId,
        sku: variant.sku.value,
        name: variant.name,
        price: variant.price.amount,
        currency: variant.price.currency,
        compareAtPrice: variant.compareAtPrice?.amount ?? null,
        costPrice: variant.costPrice?.amount ?? null,
        weight: variant.weight?.value ?? null,
        weightUnit: variant.weight?.unit ?? null,
        barcode: variant.barcode,
        isActive: variant.isActive,
        sortOrder: variant.sortOrder,
      },
    });
  }

  async updateVariant(variant: Variant): Promise<void> {
    await this.prisma.variant.update({
      where: { id: variant.id },
      data: {
        sku: variant.sku.value,
        name: variant.name,
        price: variant.price.amount,
        currency: variant.price.currency,
        compareAtPrice: variant.compareAtPrice?.amount ?? null,
        costPrice: variant.costPrice?.amount ?? null,
        weight: variant.weight?.value ?? null,
        weightUnit: variant.weight?.unit ?? null,
        barcode: variant.barcode,
        isActive: variant.isActive,
        sortOrder: variant.sortOrder,
      },
    });
  }

  async deleteVariant(id: string, storeId: string): Promise<void> {
    await this.prisma.variant.updateMany({
      where: { id, ...this.variantWhere(storeId) },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Category ───────────────────────────────────────────────────────────────

  async findCategoryById(id: string, storeId: string): Promise<Category | null> {
    const row = await this.prisma.category.findFirst({
      where: { id, ...this.categoryWhere(storeId) },
    });
    return row ? this.toCategory(row) : null;
  }

  async findCategoriesByStore(storeId: string): Promise<Category[]> {
    const rows = await this.prisma.category.findMany({
      where: this.categoryWhere(storeId),
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => this.toCategory(r));
  }

  async findCategoryBySlug(storeId: string, slug: string): Promise<Category | null> {
    const row = await this.prisma.category.findFirst({
      where: { slug, ...this.categoryWhere(storeId) },
    });
    return row ? this.toCategory(row) : null;
  }

  async saveCategory(category: Category): Promise<void> {
    await this.prisma.category.create({
      data: {
        id: category.id,
        tenantId: category.tenantId,
        storeId: category.storeId,
        parentId: category.parentId,
        name: category.name,
        slug: category.slug.value,
        description: category.description,
        imageUrl: category.imageUrl,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      },
    });
  }

  async updateCategory(category: Category): Promise<void> {
    await this.prisma.category.update({
      where: { id: category.id },
      data: {
        parentId: category.parentId,
        name: category.name,
        slug: category.slug.value,
        description: category.description,
        imageUrl: category.imageUrl,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      },
    });
  }

  async deleteCategory(id: string, storeId: string): Promise<void> {
    await this.prisma.category.updateMany({
      where: { id, ...this.categoryWhere(storeId) },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Collection ─────────────────────────────────────────────────────────────

  async findCollectionById(id: string, storeId: string): Promise<Collection | null> {
    const row = await this.prisma.collection.findFirst({
      where: { id, ...this.collectionWhere(storeId) },
    });
    return row ? this.toCollection(row) : null;
  }

  async findCollectionsByStore(storeId: string): Promise<Collection[]> {
    const rows = await this.prisma.collection.findMany({
      where: this.collectionWhere(storeId),
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map((r) => this.toCollection(r));
  }

  async findCollectionBySlug(storeId: string, slug: string): Promise<Collection | null> {
    const row = await this.prisma.collection.findFirst({
      where: { slug, ...this.collectionWhere(storeId) },
    });
    return row ? this.toCollection(row) : null;
  }

  async saveCollection(collection: Collection): Promise<void> {
    await this.prisma.collection.create({
      data: {
        id: collection.id,
        tenantId: collection.tenantId,
        storeId: collection.storeId,
        name: collection.name,
        slug: collection.slug.value,
        description: collection.description,
        imageUrl: collection.imageUrl,
        isActive: collection.isActive,
        sortOrder: collection.sortOrder,
      },
    });
  }

  async updateCollection(collection: Collection): Promise<void> {
    await this.prisma.collection.update({
      where: { id: collection.id },
      data: {
        name: collection.name,
        slug: collection.slug.value,
        description: collection.description,
        imageUrl: collection.imageUrl,
        isActive: collection.isActive,
        sortOrder: collection.sortOrder,
      },
    });
  }

  async deleteCollection(id: string, storeId: string): Promise<void> {
    await this.prisma.collection.updateMany({
      where: { id, ...this.collectionWhere(storeId) },
      data: { deletedAt: new Date() },
    });
  }
}
