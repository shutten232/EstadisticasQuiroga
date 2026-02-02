import { getDb, ensureAuth } from './firebase.js';
import { getHoyISO, formatFechaISO, calcularImpacto } from './utils.js';

const COLLECTION_NAME = 'impacto_diario';
let registros = [];
let bound = false;
let currentMonthKey = null;
let cordobaMesCache = new Map();
let saveCordobaMesTimer = null;

function qs(id){ return document.getElementById(id); }
function obtenerUltimoRegistro(){ return registros.length ? registros[0] : null; }

function renderResumen(){
  const lblFecha = qs('lblFecha');
  const lblFechaForm = qs('lblFechaForm');
  const kpiCordoba = qs('kpiCordoba');
  const kpiQuiroga = qs('kpiQuiroga');
  const kpiImpacto = qs('kpiImpacto');
  const kpiCordobaMes = qs('kpiCordobaMes');
  const kpiImpactoMes = qs('kpiPromImpactoMes');
  const kpiQuirogaMes = qs('kpiQuirogaMes');
  const inpCordobaMesManual = qs('inpCordobaMesManual');
  const inpFecha = qs('inpFecha');

  const hoyISO = getHoyISO();
  const ultimo = obtenerUltimoRegistro();

  let cordoba = 0, quiroga = 0;
  currentMonthKey = null;

  if(ultimo && typeof ultimo.fecha === 'string' && ultimo.fecha.length >= 7){
    currentMonthKey = ultimo.fecha.slice(0,7);
  }

  if(ultimo){
    cordoba = ultimo.cordoba || 0;
    quiroga = ultimo.quiroga || 0;
    if(lblFecha) lblFecha.textContent = 'Último día cargado: ' + formatFechaISO(ultimo.fecha);
  }else{
    if(lblFecha) lblFecha.textContent = 'Sin datos cargados todavía.';
  }

  if(lblFechaForm) lblFechaForm.textContent = 'Seleccioná la fecha de los datos (por defecto hoy).';
  if(inpFecha && !inpFecha.value) inpFecha.value = hoyISO;

  if(currentMonthKey){
    let sumQuirogaMes = 0;
    for(const r of registros){
      if(!r || typeof r.fecha !== 'string') continue;
      if(r.fecha.slice(0,7) !== currentMonthKey) continue;
      sumQuirogaMes += (parseInt(r.quiroga,10) || 0);
    }

    if(kpiQuirogaMes) kpiQuirogaMes.textContent = String(sumQuirogaMes || 0);

    const aplicarImpactoMes = (totalCordobaMes) => {
      if(kpiCordobaMes) kpiCordobaMes.textContent = totalCordobaMes;
      if(kpiImpactoMes){
        if(totalCordobaMes > 0){
          const impactoMes = (sumQuirogaMes / totalCordobaMes) * 100;
          kpiImpactoMes.textContent = impactoMes.toFixed(1).replace('.',',') + '%';
        }else{
          kpiImpactoMes.textContent = '–';
        }
      }
    };

    if(cordobaMesCache.has(currentMonthKey)){
      const manualVal = cordobaMesCache.get(currentMonthKey) || 0;
      aplicarImpactoMes(manualVal);
      if(inpCordobaMesManual && inpCordobaMesManual.value === '') {
        inpCordobaMesManual.value = manualVal ? String(manualVal) : '';
      }
    }else{
      if(kpiCordobaMes) kpiCordobaMes.textContent = '0';
      (async () => {
        try{
          await ensureAuth();
          const db = getDb();
          const snap = await db.collection('kpis_cordoba_mes').doc(currentMonthKey).get();
          const data = snap.exists ? snap.data() : null;
          const manualVal = data && typeof data.ph_total_cordoba !== 'undefined'
            ? (parseInt(data.ph_total_cordoba, 10) || 0)
            : 0;
          cordobaMesCache.set(currentMonthKey, manualVal);
          aplicarImpactoMes(manualVal);
          if(inpCordobaMesManual && inpCordobaMesManual.value === ''){
            inpCordobaMesManual.value = manualVal ? String(manualVal) : '';
          }
        }catch(err){
          console.error('Error leyendo kpis_cordoba_mes:', err);
        }
      })();
    }
  }else{
    if(kpiCordobaMes) kpiCordobaMes.textContent = '0';
    if(kpiImpactoMes) kpiImpactoMes.textContent = '–';
    if(kpiQuirogaMes) kpiQuirogaMes.textContent = '0';
  }

  if(kpiCordoba) kpiCordoba.textContent = cordoba;
  if(kpiQuiroga) kpiQuiroga.textContent = quiroga;

  const impactoDia = calcularImpacto(cordoba, quiroga);
  if(kpiImpacto){
    kpiImpacto.textContent = (impactoDia === null)
      ? '–'
      : impactoDia.toFixed(1).replace('.',',') + '%';
  }
}

export { renderResumen };
