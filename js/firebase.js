window.FirebaseApp = (function(){
  const firebaseConfig = {
    apiKey: "AIzaSyAq1_VIg5BtPH9QPS5NwuJDrVCqyfQ3qwU",
    authDomain: "estadisticas-diarias.firebaseapp.com",
    databaseURL: "https://estadisticas-diarias-default-rtdb.firebaseio.com",
    projectId: "estadisticas-diarias",
    storageBucket: "estadisticas-diarias.firebasestorage.app",
    messagingSenderId: "952047688138",
    appId: "1:952047688138:web:5e01162214f6ee7bd71733",
    measurementId: "G-BD9QD9241G"
  };

  // Evita doble init si se recarga la sección.
  if(!firebase.apps || firebase.apps.length === 0){
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  return {
    db,
    COLLECTION_NAME: "impacto_diario"
  };
})();
