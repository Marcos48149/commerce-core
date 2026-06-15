import { Global, Module } from '@nestjs/common';
import { UlidService } from './ulid.service';

@Global()
@Module({
  providers: [UlidService],
  exports: [UlidService],
})
export class CommonModule {}
