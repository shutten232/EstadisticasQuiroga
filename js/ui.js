export function introOncePerSession(){
  const KEY = 'qr_intro_seen_v1';
  const intro = document.getElementById('introOverlay');
  if(!intro) return;

  if(sessionStorage.getItem(KEY) === '1'){
    intro.style.display = 'none';
    return;
  }

  intro.style.display = 'flex';
  setTimeout(() => {
    intro.style.display = 'none';
    sessionStorage.setItem(KEY, '1');
  }, 1600);
}

export function setActiveNav(route){
  document.querySelectorAll('.nav-links a[data-route]').forEach(a => {
    a.classList.toggle('is-active', a.dataset.route === route);
  });
}
