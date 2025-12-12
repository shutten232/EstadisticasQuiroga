window.Sections = window.Sections || {};
['presentacion','resumen-mensual','resumen','talleres'].forEach(route => {
  if(window.Sections[route]) return;
  window.Sections[route] = {
    init(){ document.body.dataset.route = route; },
    destroy(){ document.body.dataset.route = ''; }
  };
});
