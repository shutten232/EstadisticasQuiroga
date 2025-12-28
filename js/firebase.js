export const firebaseConfig = {
  apiKey: "AIzaSyAq1_VIg5BtPH9QPS5NwuJDrVCqyfQ3qwU",
  authDomain: "estadisticas-diarias.firebaseapp.com",
  databaseURL: "https://estadisticas-diarias-default-rtdb.firebaseio.com",
  projectId: "estadisticas-diarias",
  storageBucket: "estadisticas-diarias.firebasestorage.app",
  messagingSenderId: "952047688138",
  appId: "1:952047688138:web:5e01162214f6ee7bd71733",
  measurementId: "G-BD9QD9241G"
};

let _db = null;
let _authPromise = null;

function ensureFirebaseApp(){
  if(!window.firebase) throw new Error('Firebase SDK no cargado');
  if(!firebase.apps || firebase.apps.length === 0){
    firebase.initializeApp(firebaseConfig);
  }
}

/**
 * Garantiza que exista un usuario autenticado (anon) antes de usar Firestore.
 * Requiere que index.html cargue firebase-auth.js.
 */
export function ensureAuth(){
  if(_authPromise) return _authPromise;

  _authPromise = (async () => {
    ensureFirebaseApp();
    if(!firebase.auth) throw new Error('Firebase Auth no disponible (falta firebase-auth.js)');

    // Si ya hay usuario, listo
    const current = firebase.auth().currentUser;
    if(current) return current;

    // Espera el primer estado y si no hay user, hace sign-in anónimo
    return await new Promise((resolve, reject) => {
      const unsub = firebase.auth().onAuthStateChanged(async (u) => {
        try{
          unsub();
          if(u) return resolve(u);
          const cred = await firebase.auth().signInAnonymously();
          resolve(cred.user);
        }catch(err){
          reject(err);
        }
      }, reject);
    });
  })();

  return _authPromise;
}

export function getDb(){
  if(_db) return _db;
  ensureFirebaseApp();
  _db = firebase.firestore();
  return _db;
}
