window.Sections = window.Sections || {};

window.Sections.hoy = (function(){
  const { db, COLLECTION_NAME } = window.FirebaseApp;
  let registros = [];
  let unsub = null; // por si en el futuro usamos onSnapshot
  let bound = false;

  function cargarRegistros(){
    return db.collection(COLLECTION_NAME)
      .orderBy("fecha", "desc")
      .get()
      .then(snapshot => {
        registros = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          registros.push({
            docId: doc.id,
            fecha: data.fecha,
            cordoba: data.cordoba || 0,
            quiroga: data.quiroga || 0,
            createdAt: data.createdAt || null
          });
        });
      });
  }

  function obtenerUltimoRegistro(){
    if(registros.length === 0) return null;
    return registros[0];
  }

  function renderResumen(){
    const lblFecha = document.getElementById("lblFecha");
    const lblFechaForm = document.getElementById("lblFechaForm");
    const kpiCordoba = document.getElementById("kpiCordoba");
    const kpiQuiroga = document.getElementById("kpiQuiroga");
    const kpiImpacto = document.getElementById("kpiImpacto");
    const inpFecha = document.getElementById("inpFecha");

    const hoyISO = Utils.getHoyISO();
    const ultimo = obtenerUltimoRegistro();

    let cordoba = 0;
    let quiroga = 0;

    if(ultimo){
      cordoba = ultimo.cordoba || 0;
      quiroga = ultimo.quiroga || 0;
      if(lblFecha) lblFecha.textContent = "Último día cargado: " + Utils.formatFechaISO(ultimo.fecha);
    }else{
      if(lblFecha) lblFecha.textContent = "Sin datos cargados todavía.";
    }

    if(lblFechaForm) lblFechaForm.textContent = "Seleccioná la fecha de los datos (por defecto hoy).";

    if(inpFecha && !inpFecha.value){
      inpFecha.value = hoyISO;
    }

    if(kpiCordoba) kpiCordoba.textContent = cordoba;
    if(kpiQuiroga) kpiQuiroga.textContent = quiroga;

    const impacto = Utils.calcularImpacto(cordoba, quiroga);
    if(kpiImpacto){
      kpiImpacto.textContent = (impacto === null)
        ? "–"
        : impacto.toFixed(1).replace(".",",") + "%";
    }

    const inpCordoba = document.getElementById("inpCordoba");
    const inpQuiroga = document.getElementById("inpQuiroga");
    if(inpCordoba) inpCordoba.value = "";
    if(inpQuiroga) inpQuiroga.value = "";
  }

  function renderTabla(){
    const tbody = document.getElementById("tbodyHistorial");
    if(!tbody) return;
    tbody.innerHTML = "";

    if(registros.length === 0){
      const trVacio = document.createElement("tr");
      trVacio.classList.add("empty-row");
      const tdVacio = document.createElement("td");
      tdVacio.colSpan = 5;
      tdVacio.textContent = "Sin registros guardados.";
      trVacio.appendChild(tdVacio);
      tbody.appendChild(trVacio);
      return;
    }

    registros.forEach(reg => {
      const tr = document.createElement("tr");

      const tdFecha = document.createElement("td");
      tdFecha.textContent = Utils.formatFechaISO(reg.fecha);
      tr.appendChild(tdFecha);

      const tdCordoba = document.createElement("td");
      tdCordoba.classList.add("num");
      tdCordoba.textContent = reg.cordoba || 0;
      tr.appendChild(tdCordoba);

      const tdQuiroga = document.createElement("td");
      tdQuiroga.classList.add("num");
      tdQuiroga.textContent = reg.quiroga || 0;
      tr.appendChild(tdQuiroga);

      const tdImpacto = document.createElement("td");
      tdImpacto.classList.add("impact-cell");
      const imp = Utils.calcularImpacto(reg.cordoba, reg.quiroga);
      tdImpacto.textContent = (imp === null) ? "–" : imp.toFixed(1).replace(".",",") + "%";
      tr.appendChild(tdImpacto);

      const tdSel = document.createElement("td");
      tdSel.classList.add("chk-center");
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.classList.add("fila-check");
      chk.dataset.id = reg.docId;
      tdSel.appendChild(chk);
      tr.appendChild(tdSel);

      tbody.appendChild(tr);
    });
  }

  function renderTodo(){
    renderResumen();
    renderTabla();
  }

  function bindEventsOnce(){
    if(bound) return;
    bound = true;

    const form = document.getElementById("formImpacto");
    if(form){
      form.addEventListener("submit", e => {
        e.preventDefault();

        const inpCordoba = document.getElementById("inpCordoba");
        const inpQuiroga = document.getElementById("inpQuiroga");
        const inpFecha = document.getElementById("inpFecha");

        const cordoba = parseInt(inpCordoba?.value, 10) || 0;
        const quiroga = parseInt(inpQuiroga?.value, 10) || 0;
        const fecha = inpFecha?.value || Utils.getHoyISO();

        db.collection(COLLECTION_NAME).add({
          fecha,
          cordoba,
          quiroga,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          alert("Guardado en Firebase OK");
          if(inpCordoba) inpCordoba.value = "";
          if(inpQuiroga) inpQuiroga.value = "";
          return cargarRegistros();
        })
        .then(() => renderTodo())
        .catch(err => {
          alert("Error al guardar en Firestore: " + err.message);
          console.error("Error al guardar en Firestore", err);
        });
      });
    }

    const btnBorrar = document.getElementById("btnBorrarSeleccionados");
    if(btnBorrar){
      btnBorrar.addEventListener("click", () => {
        const checks = document.querySelectorAll(".fila-check:checked");
        if(checks.length === 0) return;

        const ids = Array.from(checks).map(chk => chk.dataset.id);
        const batch = db.batch();

        ids.forEach(id => {
          const ref = db.collection(COLLECTION_NAME).doc(id);
          batch.delete(ref);
        });

        batch.commit()
          .then(() => cargarRegistros())
          .then(() => renderTodo())
          .catch(err => {
            alert("Error borrando registros: " + err.message);
            console.error("Error borrando registros", err);
          });
      });
    }

    const btnPrint = document.getElementById("btnImprimirHistorial");
    if(btnPrint){
      btnPrint.addEventListener("click", () => window.print());
    }
  }

  async function init(){
    // Marca ruta para impresión selectiva
    document.body.dataset.route = "hoy";

    bindEventsOnce();
    await cargarRegistros();
    renderTodo();
  }

  function destroy(){
    document.body.dataset.route = "";
    // Nada más por ahora. (Si se usa onSnapshot, acá se desuscribe)
    if(typeof unsub === "function"){ try{ unsub(); }catch(e){} }
    unsub = null;
    registros = [];
    bound = false; // permite rebind cuando se reinserta el HTML
  }

  return { init, destroy };
})();
