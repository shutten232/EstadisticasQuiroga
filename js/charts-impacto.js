window.Sections = window.Sections || {};

window.Sections.impacto = (function(){
  let chart1 = null;
  let chart2 = null;

  const valueLabelsPlugin = {
    id: 'valueLabels',
    afterDatasetsDraw(chart){
      const {ctx} = chart;
      const isImpactChart = true;

      chart.data.datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.hidden) return;
        meta.data.forEach((el, index) => {
          const value = dataset.data[index];
          if (value == null) return;

          const text = isImpactChart ? value + '%' : value;
          ctx.save();
          ctx.fillStyle = '#111827';
          ctx.font = 'bold 12px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';

          const x = el.x;
          const y = el.y - 3;
          ctx.fillText(text, x, y);

          ctx.restore();
        });
      });
    }
  };

  function init(){
    document.body.dataset.route = "impacto";

    const { labelsMeses, impactoCRPC, impactoObleas } = window.STATIC_DATA;

    const el1 = document.getElementById('chartImpactCrpc');
    const el2 = document.getElementById('chartImpactObleas');
    if(!el1 || !el2) return;

    chart1 = new Chart(el1, {
      type:'bar',
      data:{ labels:labelsMeses, datasets:[{
        label:'Impacto CRPC %',
        data:impactoCRPC,
        backgroundColor:'rgba(21,101,192,0.9)',
        borderRadius:8,
        barThickness:24,
        maxBarThickness:30
      }]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
          legend:{ display:false },
          tooltip:{ callbacks:{ label:ctx=>` ${ctx.parsed.y}%` } }
        },
        scales:{
          x:{ grid:{ display:false }, ticks:{ font:{ size:13, weight:'600' } } },
          y:{ beginAtZero:true, max:20, grid:{ color:'rgba(148,163,184,0.3)' }, ticks:{ font:{ size:11 } } }
        }
      },
      plugins:[valueLabelsPlugin]
    });

    chart2 = new Chart(el2, {
      type:'bar',
      data:{ labels:labelsMeses, datasets:[{
        label:'Impacto obleas %',
        data:impactoObleas,
        backgroundColor:'rgba(183,28,28,0.9)',
        borderRadius:8,
        barThickness:24,
        maxBarThickness:30
      }]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
          legend:{ display:false },
          tooltip:{ callbacks:{ label:ctx=>` ${ctx.parsed.y}%` } }
        },
        scales:{
          x:{ grid:{ display:false }, ticks:{ font:{ size:13, weight:'600' } } },
          y:{ beginAtZero:true, max:20, grid:{ color:'rgba(148,163,184,0.3)' }, ticks:{ font:{ size:11 } } }
        }
      },
      plugins:[valueLabelsPlugin]
    });
  }

  function destroy(){
    document.body.dataset.route = "";
    if(chart1){ chart1.destroy(); chart1=null; }
    if(chart2){ chart2.destroy(); chart2=null; }
  }

  return { init, destroy };
})();
