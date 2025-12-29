import { getDb, ensureAuth } from './firebase.js';
import { getHoyISO, formatFechaISO, calcularImpacto } from './utils.js';

const COLLECTION_NAME = 'impacto_diario';
let registros = [];
let bound = false;
let currentMonthKey = null;

function qs(id){ return document.getElementById(id); }
function obtenerUltimoRegistro(){ return registros.length ? registros[0] : null; }

function renderResumen(){
  const lblFecha = qs('lblFecha');
  const lblFechaForm = qs('lblFechaForm');
  const kpiCordoba = qs('kpiCordoba');
  const kpiQuiroga = qs('kpiQuiroga');
  const kpiImpacto = qs('kpiImpacto');
  const kpiCordobaMes = qs('kpiCordobaMes');
  const kpiSumaImpactoMes = qs('kpiSumaImpactoMes');
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

  // KPI: total Córdoba del mes (manual) + promedio de impacto del mes
  if(currentMonthKey){
    const key = 'cordoba_mes_total_' + currentMonthKey;
    const stored = localStorage.getItem(key);
    const manualVal = stored ? (parseInt(stored, 10) || 0) : 0;
    if(kpiCordobaMes) kpiCordobaMes.textContent = manualVal;
    if(inpCordobaMesManual && inpCordobaMesManual.value === '') inpCordobaMesManual.value = manualVal ? String(manualVal) : '';

    let suma = 0;
    let n = 0;
    for(const r of registros){
      if(!r || typeof r.fecha !== 'string') continue;
      if(r.fecha.slice(0,7) !== currentMonthKey) continue;
      const imp = calcularImpacto(r.cordoba || 0, r.quiroga || 0);
      if(imp === null) continue;
      suma += imp;
      n++;
    }
    const promedio = n ? (suma / n) : 0;
    if(kpiSumaImpactoMes) kpiSumaImpactoMes.textContent = promedio.toFixed(1).replace('.',',') + '%';
  }else{
    if(kpiCordobaMes) kpiCordobaMes.textContent = '0';
    if(kpiSumaImpactoMes) kpiSumaImpactoMes.textContent = '0%';
  }

  if(kpiCordoba) kpiCordoba.textContent = cordoba;
  if(kpiQuiroga) kpiQuiroga.textContent = quiroga;

  const impacto = calcularImpacto(cordoba, quiroga);
  if(kpiImpacto) kpiImpacto.textContent = (impacto === null) ? '–' : impacto.toFixed(1).replace('.',',') + '%';
}

function renderTabla(){
  const tbody = qs('tbodyHistorial');
  if(!tbody) return;
  tbody.innerHTML = '';

  if(!registros.length){
    const tr = document.createElement('tr');
    tr.classList.add('empty-row');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'Sin registros guardados.';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  for(const reg of registros){
    const tr = document.createElement('tr');

    const tdFecha = document.createElement('td');
    tdFecha.textContent = formatFechaISO(reg.fecha);
    tr.appendChild(tdFecha);

    const tdCordoba = document.createElement('td');
    tdCordoba.classList.add('num');
    tdCordoba.textContent = reg.cordoba || 0;
    tr.appendChild(tdCordoba);

    const tdQuiroga = document.createElement('td');
    tdQuiroga.classList.add('num');
    tdQuiroga.textContent = reg.quiroga || 0;
    tr.appendChild(tdQuiroga);

    const tdImpacto = document.createElement('td');
    const imp = calcularImpacto(reg.cordoba, reg.quiroga);
    tdImpacto.textContent = (imp === null) ? '–' : imp.toFixed(1).replace('.',',') + '%';
    tr.appendChild(tdImpacto);

    const tdSel = document.createElement('td');
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.classList.add('fila-check');
    chk.dataset.id = reg.docId;
    tdSel.appendChild(chk);
    tr.appendChild(tdSel);

    tbody.appendChild(tr);
  }
}

function renderTodo(){
  renderResumen();
  renderTabla();
}

async function cargarRegistros(){
  await ensureAuth();
  const db = getDb();
  const snapshot = await db.collection(COLLECTION_NAME).orderBy('fecha','desc').get();
  registros = [];
  snapshot.forEach(doc => {
    const data = doc.data() || {};
    registros.push({
      docId: doc.id,
      fecha: data.fecha,
      cordoba: data.cordoba || 0,
      quiroga: data.quiroga || 0,
      createdAt: data.createdAt || null
    });
  });
  renderTodo();
}

function bindEvents(){
  if(bound) return;
  bound = true;

  document.addEventListener('input', (e) => {
    const el = e.target;
    if(!el || el.id !== 'inpCordobaMesManual') return;
    if(!currentMonthKey) return;
    const v = parseInt(el.value, 10) || 0;
    localStorage.setItem('cordoba_mes_total_' + currentMonthKey, String(v));
    const kpi = qs('kpiCordobaMes');
    if(kpi) kpi.textContent = v;
  });

  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if(!form || form.id !== 'formImpacto') return;
    e.preventDefault();

    const inpCordoba = qs('inpCordoba');
    const inpQuiroga = qs('inpQuiroga');
    const inpFecha = qs('inpFecha');

    const cordoba = parseInt(inpCordoba?.value, 10) || 0;
    const quiroga = parseInt(inpQuiroga?.value, 10) || 0;
    const fecha = inpFecha?.value || getHoyISO();

    try{
    await ensureAuth();
      const db = getDb();
      await db.collection(COLLECTION_NAME).add({
        fecha, cordoba, quiroga,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Guardado en Firebase OK');
      if(inpCordoba) inpCordoba.value = '';
      if(inpQuiroga) inpQuiroga.value = '';
      await cargarRegistros();
    }catch(err){
      alert('Error al guardar en Firestore: ' + err.message);
      console.error(err);
    }
  });

  document.addEventListener('click', async (e) => {
    const t = e.target;
    if(!t) return;

    if(t.id === 'btnImprimirHistorial'){ window.print(); }

    if(t.id === 'btnBorrarSeleccionados'){
      const checks = document.querySelectorAll('.fila-check:checked');
      if(!checks.length) return;
      const ids = Array.from(checks).map(chk => chk.dataset.id);

      try{
    await ensureAuth();
        const db = getDb();
        const batch = db.batch();
        ids.forEach(id => batch.delete(db.collection(COLLECTION_NAME).doc(id)));
        await batch.commit();
        await cargarRegistros();
      }catch(err){
        alert('Error borrando registros: ' + err.message);
        console.error(err);
      }
    }
  });
}

export async function initImpactoDiario(){
  bindEvents();
  try{
    await cargarRegistros();
  }catch(err){
    alert('Error leyendo Firestore: ' + err.message);
    console.error(err);
  }
}