(async function(){
  const app = document.getElementById("app");
  const routes = {
    "presentacion": "sections/presentacion.html",
    "hoy": "sections/hoy.html",
    "resumen-mensual": "sections/resumen-mensual.html",
    "resumen": "sections/resumen.html",
    "cantidades": "sections/cantidades.html",
    "impacto": "sections/impacto.html",
    "talleres": "sections/talleres.html"
  };

  let currentRoute = null;

  async function loadRoute(route){
    if(!routes[route]) route = "presentacion";

    // destroy anterior
    if(currentRoute && window.Sections && window.Sections[currentRoute] && window.Sections[currentRoute].destroy){
      try{ window.Sections[currentRoute].destroy(); }catch(e){ console.warn(e); }
    }

    currentRoute = route;
    UI.setActiveNav(route);

    const res = await fetch(routes[route], { cache: "no-store" });
    const html = await res.text();
    app.innerHTML = html;

    // init
    if(window.Sections && window.Sections[route] && window.Sections[route].init){
      try{ await window.Sections[route].init(); }catch(e){ console.error(e); }
    }
  }

  function getHashRoute(){
    const h = (location.hash || "").replace("#","").trim();
    return h || "presentacion";
  }

  window.addEventListener("hashchange", () => loadRoute(getHashRoute()));

  UI.setIntroAutoHide();
  await loadRoute(getHashRoute());
})();
