import { initImpactoDiario } from './impacto-diario.js';
import { initChartsMensuales } from './charts-mensuales.js';
import { initChartsImpacto } from './charts-impacto.js';

const ROUTES = {
  'presentacion': './sections/presentacion.html',
  'resumen-mensual': './sections/resumen-mensual.html',
  'hoy': './sections/hoy.html',
  'resumen': './sections/resumen.html',
  'cantidades': './sections/cantidades.html',
  'impacto': './sections/impacto.html',
  'talleres': './sections/talleres.html'
};

export async function loadRoute(route){
  const app = document.getElementById('app');
  const path = ROUTES[route] || ROUTES.presentacion;

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
