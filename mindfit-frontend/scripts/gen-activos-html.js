const fs = require('fs');
const p = 'c:/Users/vicho/Desktop/mindfit/mindfit-frontend/src/app/pages/dashboard/admin/activos-registro.component.html';
fs.writeFileSync(p, `<motion-panel class="space-y-4">
  <motion-panel>
    <h2 class="text-lg font-semibold text-pure-white">Registro de activos</h2>
    <p class="text-xs text-slate-grey">Generación de ficha QR imprimible por equipo</p>
  </motion-panel>

  <form class="page-card grid gap-3 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="submit()">
    <motion-panel><label class="field-label">Nombre *</label><input class="field-input" formControlName="nombre" /></motion-panel>
    <motion-panel><label class="field-label">Marca</label><input class="field-input" formControlName="marca" /></motion-panel>
    <motion-panel><label class="field-label">Modelo</label><input class="field-input" formControlName="modelo" /></motion-panel>
    <motion-panel><label class="field-label">N° Serie</label><input class="field-input" formControlName="numeroSerie" /></motion-panel>
    <motion-panel><label class="field-label">Categoría *</label>
      <select class="field-input" formControlName="categoria">@for (c of categorias; track c.value) {<option [value]="c.value">{{ c.label }}</option>}</select>
    </motion-panel>
    <motion-panel><label class="field-label">Sucursal *</label>
      <select class="field-input" formControlName="sucursalId"><option value="">Seleccione</option>@for (s of sucursales(); track s.id) {<option [value]="s.id">{{ s.nombre }}</option>}</select>
    </motion-panel>
    <motion-panel><label class="field-label">Fecha compra</label><input type="date" class="field-input" formControlName="fechaCompra" /></motion-panel>
    <motion-panel><label class="field-label">Fin garantía</label><input type="date" class="field-input" formControlName="fechaVencimientoGarantia" /></motion-panel>
    <motion-panel><label class="field-label">Costo adquisición</label><input type="number" class="field-input" formControlName="costoAdquisicion" /></motion-panel>
    <motion-panel class="sm:col-span-2"><button type="submit" class="btn-primary w-full" [disabled]="saving() || form.invalid">@if (saving()) { Guardando... } @else { Registrar activo }</button></motion-panel>
  </form>

  <motion-panel class="grid gap-4 lg:grid-cols-2">
    <section class="page-card">
      <h3 class="mb-2 text-sm font-semibold">Activos registrados</h3>
      <ul class="max-h-64 space-y-2 overflow-y-auto text-sm">
        @for (a of activos(); track a.id) {
          <li><button type="button" class="user-row w-full text-left" (click)="selectForQr(a)">{{ a.nombre }} · {{ a.sucursal?.nombre }}</button></li>
        }
      </ul>
    </section>

    @if (selectedActivo(); as activo) {
      <section id="qr-print-sheet" class="qr-ficha page-card text-center">
        <img src="assets/mindfit-logo.png" alt="Mindfit" class="qr-logo mx-auto" />
        <p class="mt-2 text-xs uppercase tracking-widest text-orange-energy">Mindfit Ops</p>
        <p class="mt-1 text-sm text-pure-white">{{ activo.nombre }}</p>
        <div class="my-4 flex justify-center">
          <qrcode [qrdata]="scanUrl(activo)" [width]="180" errorCorrectionLevel="M" />
        </div>
        <p class="font-mono text-lg font-bold tracking-wider text-pure-white">{{ serialLabel(activo) }}</p>
        <p class="mt-1 text-xs text-slate-grey">Escanea para abrir ficha en terreno</p>
        <button type="button" class="btn-primary mt-4 no-print" (click)="printFicha()">Imprimir Ficha</button>
      </section>
    }
  </motion-panel>
</motion-panel>`.replace(/<\/?motion-panel/g, (t) => (t.includes('/') ? '</div' : '<div')));
console.log('ok');
