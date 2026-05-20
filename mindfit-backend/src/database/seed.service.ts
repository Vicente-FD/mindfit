import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import {
  CategoriaActivo,
  EstadoOperacionalActivo,
  EstadoOrdenTrabajo,
  PrioridadOrden,
  RolUsuario,
  TipoMantenimiento,
} from '../common/enums';
import { PERMISOS_BY_ROL } from '../common/interfaces/permisos-ui.interface';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';

const DEMO_PASSWORD = 'Admin123!';

interface SeedUser {
  email: string;
  nombre: string;
  rol: RolUsuario;
  sucursalKey?: 'florida' | 'condes' | 'central';
}

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepo: Repository<Sucursal>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Activo)
    private readonly activoRepo: Repository<Activo>,
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepo: Repository<OrdenTrabajo>,
  ) {}

  async onModuleInit(): Promise<void> {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const ordenCount = await this.ordenRepo.count();

    const florida = await this.upsertSucursal(
      'Sede La Florida',
      'Av. Vicuña Mackenna 6100',
      'La Florida',
      'Santiago',
    );
    const condes = await this.upsertSucursal(
      'Sede Las Condes',
      'Av. Apoquindo 4500',
      'Las Condes',
      'Santiago',
    );
    const central = await this.upsertSucursal(
      'Sucursal Central',
      'Av. Principal 100',
      'Santiago',
      'Santiago',
    );

    const sucursalMap = {
      florida: florida.id,
      condes: condes.id,
      central: central.id,
    };

    const users: SeedUser[] = [
      {
        email: 'admin@mindfit.cl',
        nombre: 'Super Admin Mindfit',
        rol: RolUsuario.ADMIN,
        sucursalKey: 'central',
      },
      {
        email: 'jefe.ops@mindfit.cl',
        nombre: 'Jefe de Operaciones',
        rol: RolUsuario.JEFE_OPERACIONES,
        sucursalKey: 'central',
      },
      {
        email: 'tecnico@mindfit.cl',
        nombre: 'Técnico de Campo',
        rol: RolUsuario.TECNICO,
        sucursalKey: 'florida',
      },
      {
        email: 'jefe.florida@mindfit.cl',
        nombre: 'Jefe Sucursal La Florida',
        rol: RolUsuario.JEFE_SUCURSAL,
        sucursalKey: 'florida',
      },
      {
        email: 'jefe.condes@mindfit.cl',
        nombre: 'Jefe Sucursal Las Condes',
        rol: RolUsuario.JEFE_SUCURSAL,
        sucursalKey: 'condes',
      },
      {
        email: 'gerente@mindfit.cl',
        nombre: 'Ejecutivo Gerencia BI',
        rol: RolUsuario.GERENTE_BI,
        sucursalKey: 'central',
      },
    ];

    const savedUsers: Record<string, Usuario> = {};

    for (const u of users) {
      let usuario = await this.usuarioRepo.findOne({
        where: { email: u.email },
      });
      if (!usuario) {
        usuario = await this.usuarioRepo.save(
          this.usuarioRepo.create({
            email: u.email,
            passwordHash,
            nombre: u.nombre,
            rol: u.rol,
            sucursalId: u.sucursalKey
              ? sucursalMap[u.sucursalKey]
              : null,
            estaActivo: true,
            permisosUi: PERMISOS_BY_ROL[u.rol] ?? {},
          }),
        );
      }
      savedUsers[u.email] = usuario;
    }

    const activosData = [
      {
        nombre: 'Cinta Correr Pro X500',
        marca: 'Technogym',
        modelo: 'X500',
        numeroSerie: 'TG-X500-001',
        categoria: CategoriaActivo.CARDIO,
        sucursalId: florida.id,
        costo: '4500000',
      },
      {
        nombre: 'Press de Pierna',
        marca: 'Life Fitness',
        modelo: 'Axiom',
        numeroSerie: 'LF-PP-042',
        categoria: CategoriaActivo.FUERZA,
        sucursalId: florida.id,
        costo: '3200000',
      },
      {
        nombre: 'Aire Acondicionado Central',
        marca: 'Carrier',
        modelo: '42QHC018',
        numeroSerie: 'CR-AC-018',
        categoria: CategoriaActivo.CLIMATIZACION,
        sucursalId: condes.id,
        costo: '2800000',
      },
      {
        nombre: 'Bomba de Agua Piscina',
        marca: 'Pedrollo',
        modelo: 'PKm 60',
        numeroSerie: 'PD-BA-060',
        categoria: CategoriaActivo.BOMBA_AGUA,
        sucursalId: condes.id,
        costo: '890000',
      },
    ];

    const activos: Activo[] = [];
    for (const a of activosData) {
      let activo = await this.activoRepo.findOne({
        where: { numeroSerie: a.numeroSerie },
      });
      if (!activo) {
        activo = this.activoRepo.create({
          nombre: a.nombre,
          marca: a.marca,
          modelo: a.modelo,
          numeroSerie: a.numeroSerie,
          categoria: a.categoria,
          sucursalId: a.sucursalId,
          costoAdquisicion: a.costo,
          documentacionUrls: [],
          estadoOperacional: EstadoOperacionalActivo.OPERATIVO,
        });
        activo = await this.activoRepo.save(activo);
      }
      activos.push(activo);
    }

    const tecnico = savedUsers['tecnico@mindfit.cl'];
    const jefeOps = savedUsers['jefe.ops@mindfit.cl'];

    const ordenesSeed = [
      {
        codigoOt: `OT-${new Date().getFullYear()}-00001`,
        activo: activos[0],
        sucursalId: florida.id,
        titulo: 'Mantenimiento cinta - ruido anómalo',
        prioridad: PrioridadOrden.ALTA,
        estado: EstadoOrdenTrabajo.ASIGNADA,
        asignadoAId: tecnico.id,
      },
      {
        codigoOt: `OT-${new Date().getFullYear()}-00002`,
        activo: activos[1],
        sucursalId: florida.id,
        titulo: 'Revisión press de pierna',
        prioridad: PrioridadOrden.MEDIA,
        estado: EstadoOrdenTrabajo.EN_PROCESO,
        asignadoAId: tecnico.id,
        fechaInicioReal: new Date(Date.now() - 45 * 60000),
      },
      {
        codigoOt: `OT-${new Date().getFullYear()}-00003`,
        activo: activos[2],
        sucursalId: condes.id,
        titulo: 'Falla climatización zona cardio',
        prioridad: PrioridadOrden.ALTA,
        estado: EstadoOrdenTrabajo.PENDIENTE,
        asignadoAId: null,
      },
    ];

    if (ordenCount === 0) {
      for (const o of ordenesSeed) {
        await this.ordenRepo.save(
          this.ordenRepo.create({
            codigoOt: o.codigoOt,
            activoId: o.activo.id,
            sucursalId: o.sucursalId,
            creadoPorId: jefeOps.id,
            asignadoAId: o.asignadoAId,
            titulo: o.titulo,
            descripcion: o.titulo,
            prioridad: o.prioridad,
            tipoMantenimiento: TipoMantenimiento.CORRECTIVO,
            estado: o.estado,
            fechaInicioReal: o.fechaInicioReal ?? null,
          }),
        );
      }
    }

    this.logger.log('Seed / usuarios demo Mindfit Ops:');
    this.logger.log('  admin@mindfit.cl (Super Admin)');
    this.logger.log('  jefe.ops@mindfit.cl (Jefe Operaciones)');
    this.logger.log('  tecnico@mindfit.cl (Técnico)');
    this.logger.log('  jefe.florida@mindfit.cl / jefe.condes@mindfit.cl');
    this.logger.log('  gerente@mindfit.cl (Ejecutivo BI)');
    this.logger.log(`  Contraseña demo: ${DEMO_PASSWORD}`);
  }

  private async upsertSucursal(
    nombre: string,
    direccion: string,
    comuna: string,
    ciudad: string,
  ): Promise<Sucursal> {
    let sucursal = await this.sucursalRepo.findOne({ where: { nombre } });
    if (!sucursal) {
      sucursal = await this.sucursalRepo.save(
        this.sucursalRepo.create({
          nombre,
          direccion,
          comuna,
          ciudad,
          estaActiva: true,
        }),
      );
    }
    return sucursal;
  }
}
