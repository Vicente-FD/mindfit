const fs = require('fs');
const fix = (s) => s.replace(/<\/?motion-panel/g, (t) => (t.includes('/') ? '</motion-panel>' : '<motion-panel>')).replace(/<\/?motion-panel>/g, (t) => t.replace('motion-panel', 'motion-panel')).replace(/<motion-panel>/g, '<div>').replace(/<\/motion-panel>/g, '</motion-panel>');

const jefe = `<motion-panel class="mx-auto max-w-6xl space-y-4">
<header class="page-card"><h1 class="text-xl font-semibold text-pure-white">Jefe de Operaciones</h1>
<nav class="tab-nav mt-4 flex flex-wrap gap-2">
<button type="button" class="tab-btn" [class.tab-active]="tab()==='ots'" (click)="setTab('ots')">Órdenes de trabajo</button>
<button type="button" class="tab-btn" [class.tab-active]="tab()==='activos'" (click)="setTab('activos')">Activos y QR</button>
<button type="button" class="tab-btn" [class.tab-active]="tab()==='usuarios'" (click)="setTab('usuarios')">Usuarios</button>
<button type="button" class="tab-btn" [class.tab-active]="tab()==='metricas'" (click)="setTab('metricas')">Métricas</button>
</nav></header>
@if (tab()==='ots') {
@if (kpis(); as k) { <motion-panel class="grid grid-cols-2 gap-3"><motion-panel class="metric-card"><p class="metric-label">PE global</p><p class="metric-value text-status-green">{{ k.efectividadPe }}%</p></motion-panel><motion-panel class="metric-card"><p class="metric-label">OTs reportadas</p><p class="metric-value">{{ k.otsReportadas }}</p></motion-panel></motion-panel> }
<form class="page-card grid gap-3 sm:grid-cols-2" [formGroup]="otForm" (ngSubmit)="crearOt()">
<motion-panel class="sm:col-span-2"><label class="field-label">Título OT</label><input class="field-input" formControlName="titulo" /></motion-panel>
<motion-panel><label class="field-label">Sucursal</label><select class="field-input" formControlName="sucursalId"><option value="">Seleccione</option>@for (s of sucursales(); track s.id) {<option [value]="s.id">{{ s.nombre }}</option>}</select></motion-panel>
<motion-panel><label class="field-label">Activo</label><select class="field-input" formControlName="activoId"><option value="">Opcional</option>@for (a of activos(); track a.id) {<option [value]="a.id">{{ a.nombre }}</option>}</select></motion-panel>
<motion-panel><label class="field-label">Prioridad</label><select class="field-input" formControlName="prioridad">@for (p of prioridades; track p.value) {<option [value]="p.value">{{ p.label }}</option>}</select></motion-panel>
<motion-panel><label class="field-label">Asignar técnico</label><select class="field-input" formControlName="asignadoAId"><option value="">Sin asignar</option>@for (t of tecnicos(); track t.id) {<option [value]="t.id">{{ t.nombre }}</option>}</select></motion-panel>
<motion-panel class="sm:col-span-2"><label class="field-label">Descripción</label><textarea class="field-input" rows="2" formControlName="descripcion"></textarea></motion-panel>
<button type="submit" class="btn-primary sm:col-span-2">Crear y asignar OT</button></form>
<section class="space-y-2">@for (o of ordenes(); track o.id) {
<article class="ot-card"><motion-panel class="flex justify-between gap-2"><span class="text-sm font-semibold">{{ o.codigoOt }}</span><span class="text-xs text-slate-grey">{{ estadoLabel(o.estado) }}</span></motion-panel>
<p class="text-sm text-pure-white">{{ o.titulo }}</p>
@if (o.estado==='pendiente' || o.estado==='asignada') {
<select class="field-input mt-2 text-xs" #sel><option value="">Asignar técnico...</option>@for (t of tecnicos(); track t.id) {<option [value]="t.id">{{ t.nombre }}</option>}</select>
<button type="button" class="btn-primary mt-2 w-full text-xs py-2" (click)="asignar(o, sel.value)">Confirmar asignación</button>
}</motion-panel></article>}</section>
}
@if (tab()==='activos') { <app-activos-registro /> }
@if (tab()==='usuarios') { <app-usuarios-admin /> }
@if (tab()==='metricas') { <section class="page-card"><p class="text-sm text-slate-grey">Use el dashboard Gerencia BI para analítica avanzada. Aquí ve resumen operativo en pestaña OTs.</p></section> }
</motion-panel>`;

const sucursal = `<motion-panel class="mx-auto max-w-lg space-y-4 pb-4">
<header class="rounded-2xl border border-white/5 bg-obsidian-grey p-4"><h1 class="text-lg font-semibold">Reporte de fallas</h1><p class="text-xs text-slate-grey">Solo activos de su sede asignada</p></header>
<form class="page-card space-y-3" [formGroup]="reportForm" (ngSubmit)="enviarReporte()">
<label class="field-label">Activo *</label><select class="field-input" formControlName="activoId"><option value="">Seleccione equipo</option>@for (a of activos(); track a.id) {<option [value]="a.id">{{ a.nombre }}</option>}</select>
<label class="field-label">Prioridad *</label><select class="field-input" formControlName="prioridad">@for (p of prioridades; track p.value) {<option [value]="p.value">{{ p.label }}</option>}</select>
<label class="field-label">Descripción *</label><textarea class="field-input" rows="4" formControlName="descripcion"></textarea>
<label class="upload-box block text-center"><span>Adjuntar foto de la falla</span><input type="file" accept="image/*" class="hidden" (change)="onFoto($event)" /></label>
<button type="submit" class="btn-primary w-full" [disabled]="saving()">Enviar ticket</button>
</form>
<section class="page-card"><h2 class="mb-3 text-sm font-semibold">Historial de la sede</h2>
@for (o of ordenes(); track o.id) {
<article class="ot-card mb-2"><p class="text-sm font-medium">{{ o.titulo }}</p><p class="text-xs text-slate-grey">{{ o.codigoOt }} · {{ estadoLabel(o.estado) }}</p></article>
}</section></motion-panel>`;

const gerente = `<motion-panel class="mx-auto max-w-6xl space-y-4">
<header class="page-card"><h1 class="text-xl font-semibold">Dashboard Ejecutivo — Gerencia BI</h1>
<form class="mt-4 grid gap-3 sm:grid-cols-3" [formGroup]="filterForm">
<motion-panel><label class="field-label">Sucursal</label><select class="field-input" formControlName="sucursalId" (change)="loadKpis()"><option value="">Todas</option>@for (s of sucursales(); track s.id) {<option [value]="s.id">{{ s.nombre }}</option>}</select></motion-panel>
<motion-panel><label class="field-label">Técnico</label><select class="field-input" formControlName="tecnicoId" (change)="loadKpis()"><option value="">Todos</option>@for (t of tecnicos(); track t.id) {<option [value]="t.id">{{ t.nombre }}</option>}</select></motion-panel>
<motion-panel><label class="field-label">Categoría</label><select class="field-input" formControlName="categoria" (change)="loadKpis()"><option value="">Todas</option>@for (c of categorias; track c.value) {<option [value]="c.value">{{ c.label }}</option>}</select></motion-panel>
</form></header>
@if (kpis(); as k) {
<motion-panel class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
<motion-panel class="kpi-card"><p class="metric-label">Efectividad (PE)</p><p class="kpi-value text-status-green">{{ k.efectividadPe }}%</p><p class="text-xs text-slate-grey">{{ k.otsResueltas }}/{{ k.otsReportadas }} OTs</p></motion-panel>
<motion-panel class="kpi-card"><p class="metric-label">Gasto acumulado</p><p class="kpi-value">{{ k.gastoAcumuladoMantenimiento | number }}</p><p class="text-xs text-slate-grey">CLP equipos</p></motion-panel>
<motion-panel class="kpi-card"><p class="metric-label">MTTR</p><p class="kpi-value text-orange-energy">{{ k.mttrHoras }} h</p><p class="text-xs text-slate-grey">Tiempo medio reparación</p></motion-panel>
<motion-panel class="kpi-card"><p class="metric-label">OTs reportadas</p><p class="kpi-value">{{ k.otsReportadas }}</p></motion-panel>
</motion-panel>
<motion-panel class="grid gap-4 lg:grid-cols-2">
<motion-panel class="chart-card"><h3 class="mb-3 text-sm font-semibold">Fallas por categoría</h3>
@for (f of k.fallasPorCategoria; track f.categoria) {
<motion-panel class="mb-2"><motion-panel class="flex justify-between text-xs"><span>{{ f.categoria }}</span><span>{{ f.total }}</span></motion-panel>
<motion-panel class="chart-bar"><motion-panel class="chart-fill" [style.width.%]="barWidth(f.total, maxCat())"></motion-panel></motion-panel></motion-panel>
}</motion-panel>
<motion-panel class="chart-card"><h3 class="mb-3 text-sm font-semibold">OTs por sucursal</h3>
@for (s of k.otsPorSucursal; track s.sucursal) {
<motion-panel class="mb-2 flex items-center gap-3"><motion-panel class="donut-placeholder">{{ s.total }}</motion-panel><span class="text-sm">{{ s.sucursal }}</span></motion-panel>
}</motion-panel></motion-panel>
}</motion-panel>`;

const fixAll = (html) =>
  html
    .replace(/<motion-panel/g, '<div')
    .replace(/<\/motion-panel>/g, '</motion-panel>')
    .replace(/<\/motion-panel>/g, '</div>');

fs.writeFileSync('c:/Users/vicho/Desktop/mindfit/mindfit-frontend/src/app/pages/dashboard/jefe-operaciones/jefe-operaciones-dashboard.component.html', fixAll(jefe));
fs.writeFileSync('c:/Users/vicho/Desktop/mindfit/mindfit-frontend/src/app/pages/dashboard/sucursal/sucursal-dashboard.component.html', fixAll(sucursal));
fs.writeFileSync('c:/Users/vicho/Desktop/mindfit/mindfit-frontend/src/app/pages/dashboard/gerente/gerente-dashboard.component.html', fixAll(gerente));
console.log('ok');
