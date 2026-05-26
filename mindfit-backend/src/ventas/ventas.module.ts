import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  imports: [AnalyticsModule],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService],
})
export class VentasModule {}