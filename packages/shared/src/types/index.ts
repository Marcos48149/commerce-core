export interface Ulid extends String {
  _ulidBrand: never;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface StoreScoped {
  tenantId: string;
  storeId: string;
}

export interface PlatformScoped {
  tenantId: string;
}
