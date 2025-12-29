import { initImpactoDiario } from './impacto-diario.js';
import { initChartsMensuales } from './charts-mensuales.js';
import { initChartsImpacto } from './charts-impacto.js';

const SECTIONS_BASE = new URL('../sections/', import.meta.url);

const ROUTES = {
  'presentacion': 'presentacion.html',
  'resumen-mensual': 'resumen-mensual.html',
  'hoy': 'hoy.html',
  'resumen': 'resumen.html',
  'cantidades': 'cantidades.html',
  'impacto': 'impacto.html',
  'talleres': 'talleres.html'
};

export async function loadRoute(route){
  const app = document.getElementById('app');
  const rel = ROUTES[route] || ROUTES.presentacion;
  const path = new URL(rel, SECTIONS_BASE).toString();

  try{
    const res = await fetch(path, { cache: 'no-store' });
    if(!res.ok) throw new Error('No se pudo cargar ' + path);
    app.innerHTML = await res.text();
  }catch(err){
    console.error(err);
    app.innerHTML = '<div class="card"><div class="card-title">Error</div><p class="card-note">No se pudo cargar la sección.</p></div>';
    return;
  }

  if(route === 'hoy') await initImpactoDiario();
  if(route === 'cantidades') initChartsMensuales();
  if(route === 'impacto') initChartsImpacto();
}
