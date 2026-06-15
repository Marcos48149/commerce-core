import { Injectable } from '@nestjs/common';
import { ulid } from 'ulidx';

@Injectable()
export class UlidService {
  generate(): string {
    return ulid();
  }

  isValid(value: string): boolean {
    return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/i.test(value);
  }
}
