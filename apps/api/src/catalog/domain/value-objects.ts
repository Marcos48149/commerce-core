import { ValidationError } from '@commerce/shared';

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string,
  ) {}

  static create(amount: number, currency: string = 'ARS'): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new ValidationError('Amount must be a non-negative finite number');
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new ValidationError('Currency must be a valid ISO 4217 code');
    }
    return new Money(Math.round(amount * 100) / 100, currency);
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new ValidationError('Cannot add Money with different currencies');
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new ValidationError('Cannot subtract Money with different currencies');
    }
    return Money.create(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor, this.currency);
  }

  toJSON() {
    return { amount: this.amount, currency: this.currency };
  }
}

export class Slug {
  private constructor(public readonly value: string) {}

  static create(input: string): Slug {
    const slug = input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug || slug.length > 255) {
      throw new ValidationError('Slug must be between 1 and 255 characters');
    }

    return new Slug(slug);
  }

  toJSON() {
    return this.value;
  }
}

export class Sku {
  private constructor(public readonly value: string) {}

  static create(input: string): Sku {
    const sku = input.trim().toUpperCase();

    if (!sku || sku.length > 100) {
      throw new ValidationError('SKU must be between 1 and 100 characters');
    }

    return new Sku(sku);
  }

  toJSON() {
    return this.value;
  }
}

export class Weight {
  private constructor(
    public readonly value: number,
    public readonly unit: 'g' | 'kg' | 'lb' | 'oz',
  ) {}

  static create(value: number, unit: 'g' | 'kg' | 'lb' | 'oz' = 'g'): Weight {
    if (!Number.isFinite(value) || value < 0) {
      throw new ValidationError('Weight must be a non-negative finite number');
    }
    return new Weight(value, unit);
  }

  toJSON() {
    return { value: this.value, unit: this.unit };
  }
}

export class Dimensions {
  private constructor(
    public readonly length: number,
    public readonly width: number,
    public readonly height: number,
    public readonly unit: 'cm' | 'in',
  ) {}

  static create(
    length: number,
    width: number,
    height: number,
    unit: 'cm' | 'in' = 'cm',
  ): Dimensions {
    for (const dim of [length, width, height]) {
      if (!Number.isFinite(dim) || dim < 0) {
        throw new ValidationError('Dimensions must be non-negative finite numbers');
      }
    }
    return new Dimensions(length, width, height, unit);
  }

  toJSON() {
    return { length: this.length, width: this.width, height: this.height, unit: this.unit };
  }
}
