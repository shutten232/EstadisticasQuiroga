window.Utils = {
  getHoyISO(){
    const hoy = new Date();
    return hoy.toISOString().slice(0,10);
  },
  formatFechaISO(fechaISO){
    const partes = String(fechaISO||"").split("-");
    if(partes.length !== 3) return String(fechaISO||"");
    const [y,m,d] = partes;
    return d + "/" + m + "/" + y;
  },
  calcularImpacto(cordoba, quiroga){
    if(Number(cordoba) <= 0) return null;
    return (Number(quiroga) / Number(cordoba)) * 100;
  }
};
