import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import {
  CategoriaActivo,
  EstadoOperacionalActivo,
  EstadoOrdenTrabajo,
  EstadoSesionUsuario,
  PrioridadOrden,
  RolUsuario,
  TipoMantenimiento,
} from '../common/enums';
import { PERMISOS_BY_ROL } from '../common/interfaces/permisos-ui.interface';
import { Sucursal } from '../entities/sucursal.entity';
import { Usuario } from '../entities/usuario.entity';
import { Activo } from '../entities/activo.entity';
import { OrdenTrabajo } from '../entities/orden-trabajo.entity';
import { Marca } from '../entities/marca.entity';
import { Categoria } from '../entities/categoria.entity';
import { Repuesto } from '../entities/repuesto.entity';
import { BodegaStock } from '../entities/bodega-stock.entity';

const DEMO_PASSWORD = 'Admin123!';

interface SeedUser {
  email: string;
  nombre: string;
  rol: RolUsuario;
  sucursalKey?: 'florida' | 'condes' | 'vina' | null;
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
    @InjectRepository(Marca)
    private readonly marcaRepo: Repository<Marca>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Repuesto)
    private readonly repuestoRepo: Repository<Repuesto>,
    @InjectRepository(BodegaStock)
    private readonly bodegaStockRepo: Repository<BodegaStock>,
  ) {}

  async onModuleInit(): Promise<void> {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
    const ordenCount = await this.ordenRepo.count();

    await this.seedMarcas();

    const florida = await this.upsertSucursal(
      'Sede La Florida',
      'LF',
      'Av. Vicuña Mackenna 6100',
      'La Florida',
      'Santiago',
    );
    const condes = await this.upsertSucursal(
      'Sede Las Condes',
      'LC',
      'Av. Apoquindo 4500',
      'Las Condes',
      'Santiago',
      3,
    );
    await this.upsertSucursal(
      'Sede Viña del Mar',
      'VM',
      'Av. Libertad 1340',
      'Viña del Mar',
      'Valparaíso',
    );

    const sucursalMap: Record<string, number> = {
      florida: florida.id,
      condes: condes.id,
    };

    const users: SeedUser[] = [
      {
        email: 'admin@mindfit.cl',
        nombre: 'Super Admin Mindfit',
        rol: RolUsuario.ADMIN,
        sucursalKey: null,
      },
      {
        email: 'jefe.ops@mindfit.cl',
        nombre: 'Jefe de Operaciones',
        rol: RolUsuario.JEFE_OPERACIONES,
        sucursalKey: null,
      },
      {
        email: 'tecnico@mindfit.cl',
        nombre: 'Técnico de Campo',
        rol: RolUsuario.TECNICO,
        sucursalKey: null,
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
        sucursalKey: null,
      },
      {
        email: 'bodeguero@mindfit.cl',
        nombre: 'Bodeguero Central',
        rol: RolUsuario.BODEGUERO,
        sucursalKey: null,
      },
      {
        email: 'ventas@mindfit.cl',
        nombre: 'Ejecutivo Comercial',
        rol: RolUsuario.EJECUTIVO_VENTAS,
        sucursalKey: null,
      },
    ];

    const savedUsers: Record<string, Usuario> = {};

    for (const u of users) {
      let usuario = await this.usuarioRepo.findOne({
        where: { email: u.email },
      });
      const sucursalId =
        u.sucursalKey != null ? sucursalMap[u.sucursalKey] : null;

      if (!usuario) {
        usuario = await this.usuarioRepo.save(
          this.usuarioRepo.create({
            email: u.email,
            passwordHash,
            nombre: u.nombre,
            rol: u.rol,
            sucursalId,
            estaActivo: true,
            estadoSesion: EstadoSesionUsuario.DESCONECTADO,
            permisosUi: PERMISOS_BY_ROL[u.rol] ?? {},
          }),
        );
      } else {
        if (process.env.NODE_ENV !== 'production') {
          usuario.passwordHash = passwordHash;
          usuario.estaActivo = true;
        }
        if (u.sucursalKey === null && u.rol !== RolUsuario.JEFE_SUCURSAL) {
          usuario.sucursalId = null;
        } else if (u.sucursalKey != null) {
          usuario.sucursalId = sucursalId;
        }
        await this.usuarioRepo.save(usuario);
      }
      savedUsers[u.email] = usuario;
    }

    const matrix = await this.marcaRepo.findOne({ where: { sigla: 'MX' } });
    const life = await this.marcaRepo.findOne({ where: { sigla: 'LF' } });
    const carrier = await this.marcaRepo.findOne({ where: { sigla: 'CR' } });
    const pedrollo = await this.marcaRepo.findOne({ where: { sigla: 'PD' } });

    const catCardio = await this.categoriaRepo.findOne({ where: { sigla: 'CR' } });
    const catFuerza = await this.categoriaRepo.findOne({ where: { sigla: 'FZ' } });
    const catClima = await this.categoriaRepo.findOne({ where: { sigla: 'CL' } });
    const catBomba = await this.categoriaRepo.findOne({ where: { sigla: 'BA' } });

    const activosData = [
      {
        nombre: 'Cinta Correr Pro X500',
        marcaId: matrix?.id,
        marca: 'Matrix',
        modelo: 'X500',
        codigo: 'LF-MX-25-CR-01',
        categoria: CategoriaActivo.CARDIO,
        categoriaId: catCardio?.id,
        sucursalId: florida.id,
        pisoAsignado: null as number | null,
        costo: '4500000',
        fechaCompra: '2025-01-15',
      },
      {
        nombre: 'Press de Pierna',
        marcaId: life?.id,
        marca: 'Life Fitness',
        modelo: 'Axiom',
        codigo: 'LF-LF-25-FZ-01',
        categoria: CategoriaActivo.FUERZA,
        categoriaId: catFuerza?.id,
        sucursalId: florida.id,
        pisoAsignado: null as number | null,
        costo: '3200000',
        fechaCompra: '2025-03-10',
      },
      {
        nombre: 'Aire Acondicionado Central',
        marcaId: carrier?.id,
        marca: 'Carrier',
        modelo: '42QHC018',
        codigo: 'LC-CR-24-CL-01',
        categoria: CategoriaActivo.CLIMATIZACION,
        categoriaId: catClima?.id,
        sucursalId: condes.id,
        pisoAsignado: 2,
        costo: '2800000',
        fechaCompra: '2024-06-01',
      },
      {
        nombre: 'Bomba de Agua Piscina',
        marcaId: pedrollo?.id,
        marca: 'Pedrollo',
        modelo: 'PKm 60',
        codigo: 'LC-PD-24-BA-01',
        categoria: CategoriaActivo.BOMBA_AGUA,
        categoriaId: catBomba?.id,
        sucursalId: condes.id,
        pisoAsignado: 1,
        costo: '890000',
        fechaCompra: '2024-08-20',
      },
    ];

    const activos: Activo[] = [];
    for (const a of activosData) {
      let activo = await this.activoRepo.findOne({
        where: { codigoInventario: a.codigo },
      });
      if (!activo) {
        activo = this.activoRepo.create({
          nombre: a.nombre,
          marcaId: a.marcaId ?? null,
          marca: a.marca,
          modelo: a.modelo,
          codigoInventario: a.codigo,
          codigoQrToken: a.codigo,
          categoria: a.categoria,
          categoriaId: a.categoriaId ?? null,
          pisoAsignado: a.pisoAsignado ?? null,
          sucursalId: a.sucursalId,
          fechaCompra: a.fechaCompra,
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

    await this.seedInventario();

    this.logger.log('Seed Mindfit Ops listo (marcas, siglas, usuarios demo)');
    this.logger.log(`  Contraseña demo: ${DEMO_PASSWORD}`);
  }

  private async seedInventario(): Promise<void> {
    const catalogo = [
      {
        sku: 'MF-BELT-001',
        nombre: 'Correa transmisión cinta',
        costo: 45000,
        stock: 12,
        min: 5,
      },
      {
        sku: 'MF-LUBE-002',
        nombre: 'Lubricante cadena 500ml',
        costo: 8900,
        stock: 30,
        min: 10,
      },
      {
        sku: 'MF-ELEC-003',
        nombre: 'Fusible industrial 25A',
        costo: 3200,
        stock: 8,
        min: 5,
      },
    ];

    for (const item of catalogo) {
      let repuesto = await this.repuestoRepo.findOne({
        where: { sku: item.sku },
      });
      if (!repuesto) {
        repuesto = await this.repuestoRepo.save(
          this.repuestoRepo.create({
            sku: item.sku,
            nombre: item.nombre,
            descripcion: `Insumo demo ${item.sku}`,
            costoUnitario: String(item.costo),
          }),
        );
      }

      const exists = await this.bodegaStockRepo.findOne({
        where: { repuestoId: repuesto.id },
      });
      if (!exists) {
        await this.bodegaStockRepo.save(
          this.bodegaStockRepo.create({
            repuestoId: repuesto.id,
            cantidadActual: item.stock,
            cantidadMinimaAlerta: item.min,
          }),
        );
      }
    }
  }

  private async seedMarcas(): Promise<void> {
    const marcas = [
      { nombre: 'Matrix', sigla: 'MX' },
      { nombre: 'Life Fitness', sigla: 'LF' },
      { nombre: 'Precor', sigla: 'PR' },
      { nombre: 'Technogym', sigla: 'TG' },
      { nombre: 'Carrier', sigla: 'CR' },
      { nombre: 'Pedrollo', sigla: 'PD' },
    ];
    for (const m of marcas) {
      const exists = await this.marcaRepo.findOne({
        where: [{ nombre: m.nombre }, { sigla: m.sigla }],
      });
      if (!exists) {
        await this.marcaRepo.save(this.marcaRepo.create(m));
      }
    }
  }

  private async upsertSucursal(
    nombre: string,
    sigla: string,
    direccion: string,
    comuna: string,
    ciudad: string,
    cantidadPisos = 1,
  ): Promise<Sucursal> {
    let sucursal = await this.sucursalRepo.findOne({ where: { nombre } });
    if (!sucursal) {
      sucursal = await this.sucursalRepo.save(
        this.sucursalRepo.create({
          nombre,
          sigla,
          direccion,
          comuna,
          ciudad,
          estaActiva: true,
          cantidadPisos,
        }),
      );
    } else {
      if (!sucursal.sigla) sucursal.sigla = sigla;
      if (cantidadPisos > 1) sucursal.cantidadPisos = cantidadPisos;
      sucursal = await this.sucursalRepo.save(sucursal);
    }
    return sucursal;
  }
}
