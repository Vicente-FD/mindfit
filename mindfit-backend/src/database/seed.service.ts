import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RolUsuario } from '../common/enums';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepo: Repository<Sucursal>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async onModuleInit(): Promise<void> {
    const adminExists = await this.usuarioRepo.findOne({
      where: { email: 'admin@mindfit.cl' },
    });
    if (adminExists) {
      return;
    }

    let sucursal = await this.sucursalRepo.findOne({
      where: { nombre: 'Sucursal Central' },
    });
    if (!sucursal) {
      sucursal = await this.sucursalRepo.save(
        this.sucursalRepo.create({
          nombre: 'Sucursal Central',
          direccion: 'Av. Principal 100',
          comuna: 'Santiago',
          ciudad: 'Santiago',
          estaActiva: true,
        }),
      );
    }

    const passwordHash = await bcrypt.hash('Admin123!', 12);
    await this.usuarioRepo.save(
      this.usuarioRepo.create({
        email: 'admin@mindfit.cl',
        passwordHash,
        nombre: 'Administrador Mindfit',
        rol: RolUsuario.ADMIN,
        sucursalId: sucursal.id,
        estaActivo: true,
      }),
    );

    this.logger.log(
      'Usuario admin sembrado: admin@mindfit.cl / Admin123!',
    );
  }
}
