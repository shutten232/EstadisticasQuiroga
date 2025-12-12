import { labelsMeses, dataCRPC, dataObleasTotales } from '../data/static-data.js';

const valueLabelsPlugin = {
  id: 'valueLabels',
  afterDatasetsDraw(chart){
    const {ctx} = chart;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if(meta.hidden) return;
      meta.data.forEach((el, index) => {
        const value = dataset.data[index];
        if(value == null) return;
        ctx.save();
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(value), el.x, el.y - 3);
        ctx.restore();
      });
    });
  }
};

export function initChartsMensuales(){
  const c1 = document.getElementById('chartCrpcMes');
  const c2 = document.getElementById('chartObleasMes');
  if(!c1 || !c2 || !window.Chart) return;

  new Chart(c1, {
    type:'bar',
    data:{ labels:labelsMeses, datasets:[{
      label:'CRPC',
      data:dataCRPC,
      backgroundColor:'rgba(17,24,39,0.9)',
      borderRadius:8,
      barThickness:26,
      maxBarThickness:32
    }]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ display:false }, ticks:{ font:{ size:13, weight:'600' } } },
        y:{ beginAtZero:true, grid:{ color:'rgba(148,163,184,0.3)' }, ticks:{ font:{ size:11 } } }
      }
    },
    plugins:[valueLabelsPlugin]
  });

  new Chart(c2, {
    type:'bar',
    data:{ labels:labelsMeses, datasets:[{
      label:'Obleas',
      data:dataObleasTotales,
      backgroundColor:'rgba(183,28,28,0.9)',
      borderRadius:8,
      barThickness:26,
      maxBarThickness:32
    }]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ display:false } },
      scales:{
        x:{ grid:{ display:false }, ticks:{ font:{ size:13, weight:'600' } } },
        y:{ beginAtZero:true, grid:{ color:'rgba(148,163,184,0.3)' }, ticks:{ font:{ size:11 } } }
      }
    },
    plugins:[valueLabelsPlugin]
  });
}
