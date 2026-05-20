# PostgreSQL en Windows (sin Docker) — Mindfit Ops

## Estado

- PostgreSQL 15 instalado en `C:\Program Files\PostgreSQL\15`
- Servicio: `postgresql-x64-15`
- El `.env` del backend ya apunta a:
  - `DB_HOST=127.0.0.1`
  - `DB_PASSWORD=mindfitpass123`
  - `DB_NAME=mindfit_ops`

## Paso 1 — Configurar contraseña y base de datos (una sola vez)

El instalador de winget pide una contraseña propia. Para alinearla con el proyecto:

1. Abre **PowerShell como Administrador** (clic derecho → Ejecutar como administrador).
2. Ejecuta:

```powershell
cd C:\Users\vicho\Desktop\mindfit\scripts
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-postgres-windows.ps1
```

Eso dejará `postgres` / `mindfitpass123` y creará la BD `mindfit_ops`.

### Alternativa manual (pgAdmin)

Si prefieres la interfaz gráfica:

1. Abre **pgAdmin 4** desde el menú Inicio.
2. Conecta al servidor local (usa la contraseña que elegiste en el instalador).
3. Clic derecho en **Databases** → **Create** → **Database** → nombre: `mindfit_ops`.
4. Si quieres usar la del proyecto: **Login/Group Roles** → `postgres` → **Definition** → password: `mindfitpass123`.

## Paso 2 — Arrancar el backend

```powershell
cd C:\Users\vicho\Desktop\mindfit\mindfit-backend
npm run start:dev
```

Deberías ver que NestJS conecta sin `ECONNREFUSED`.

## Paso 3 — Probar login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@mindfit.cl",
  "password": "Admin123!"
}
```

## Comandos útiles

```powershell
# Ver si el servicio corre
Get-Service postgresql-x64-15

# Conectar por terminal (tras el script de setup)
$env:PGPASSWORD = "mindfitpass123"
& "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h 127.0.0.1 -U postgres -d mindfit_ops
```
