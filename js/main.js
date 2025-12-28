import { introOncePerSession, setActiveNav } from './ui.js';
import { loadRoute } from './router.js';

const firebaseConfig = FIREBASE_CONFIG_ACA;

// Evita inicializar 2 veces si recarga módulos
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

introOncePerSession();

async function ensureAnonAuth() {
  // Si ya hay usuario, listo
  if (firebase.auth().currentUser) return;

  // Espera estado de auth + login anónimo si hace falta
  await new Promise((resolve, reject) => {
    const unsub = firebase.auth().onAuthStateChanged(async (u) => {
      try {
        unsub();
        if (u) return resolve();
        await firebase.auth().signInAnonymously();
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function onRouteChange() {
  const route = (location.hash || '#presentacion').slice(1);
  setActiveNav(route);

  // IMPORTANTE: auth antes de tocar Firestore
  await ensureAnonAuth();

  loadRoute(route);
}

window.addEventListener('hashchange', () => {
  onRouteChange().catch(console.error);
});

window.addEventListener('DOMContentLoaded', () => {
  (async () => {
    try {
      if (!location.hash) location.hash = '#presentacion';
      await onRouteChange();
    } catch (e) {
      console.error(e);
      alert('Error de autenticación Firebase. Revisá que "Anónimo" esté habilitado en Authentication.');
    }
  })();
});
