export function getHoyISO(){
  const hoy = new Date();
  return hoy.toISOString().slice(0,10);
}
export function formatFechaISO(fechaISO){
  const partes = (fechaISO || '').split('-');
  if(partes.length !== 3) return fechaISO || '';
  const [y,m,d] = partes;
  return d + '/' + m + '/' + y;
}
export function calcularImpacto(cordoba, quiroga){
  if(cordoba <= 0) return null;
  return (quiroga / cordoba) * 100;
}
