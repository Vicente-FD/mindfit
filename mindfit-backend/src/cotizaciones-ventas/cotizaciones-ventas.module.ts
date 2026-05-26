import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CotizacionVenta } from '../entities/cotizacion-venta.entity';
import { CotizacionVentasDetalle } from '../entities/cotizacion-ventas-detalle.entity';
import { ClientesModule } from '../clientes/clientes.module';
import { DivisasModule } from '../divisas/divisas.module';
import { CotizacionesVentasController } from './cotizaciones-ventas.controller';
import { CotizacionesVentasService } from './cotizaciones-ventas.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CotizacionVenta, CotizacionVentasDetalle]),
    ClientesModule,
    DivisasModule,
  ],
  controllers: [CotizacionesVentasController],
  providers: [CotizacionesVentasService],
  exports: [CotizacionesVentasService],
})
export class CotizacionesVentasModule {}
