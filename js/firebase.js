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

export function getDb(){
  if(_db) return _db;
  if(!window.firebase) throw new Error('Firebase SDK no cargado');
  if(!firebase.apps || firebase.apps.length === 0){
    firebase.initializeApp(firebaseConfig);
  }
  _db = firebase.firestore();
  return _db;
}
