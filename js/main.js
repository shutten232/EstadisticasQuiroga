import { introOncePerSession, setActiveNav } from './ui.js';
import { loadRoute } from './router.js';

introOncePerSession();

function onRouteChange(){
  const route = (location.hash || '#presentacion').slice(1);
  setActiveNav(route);
  loadRoute(route);
}

window.addEventListener('hashchange', onRouteChange);
window.addEventListener('DOMContentLoaded', () => {
  if(!location.hash) location.hash = '#presentacion';
  onRouteChange();
});
