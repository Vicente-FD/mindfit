import { Module } from '@nestjs/common';
import { DivisasController } from './divisas.controller';
import { DivisasService } from './divisas.service';

@Module({
  controllers: [DivisasController],
  providers: [DivisasService],
  exports: [DivisasService],
})
export class DivisasModule {}
