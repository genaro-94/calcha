// =========================
// CALCHA - MOTOR COMPLETO (RESTAURADO)
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const WHATSAPP_ADMIN = "5493875181644";

  // ------------------------
  // NUEVO: Tipos de operación disponibles
  // ------------------------
  const tiposOperacion = ["pedido", "reserva", "info", "mixto"];

  function sumarMiComercio() {
    const mensaje = encodeURIComponent(
      "Hola 👋 Quiero sumar mi comercio a Calcha 🏔️\n\n" +
      "Nombre del comercio:\n" +
      "Rubro:\n" +
      "Dirección:\n" +
      "Teléfono:\n" +
      "¿Delivery / Retiro?:"
    );

    const url = `https://wa.me/${WHATSAPP_ADMIN}?text=${mensaje}`;
    window.open(url, "_blank");
  }

  let vistaActual = "home";
  let comercioActivo = null;
  let carrito = [];
  let tipoEntrega = null;
  let direccionEntrega = "";
  let rubroActivo = "todos";
  let menuRubrosAbierto = false;
  let comercios = [];

  // ------------------------
  // LIGHTBOX GLOBAL
  // ------------------------
  // Agregar al body un solo lightbox
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.className = "lightbox hidden";
  const lightboxImg = document.createElement("img");
  lightboxImg.id = "lightbox-img";
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);

  // ------------------------
// LIGHTBOX MEJORADO
// ------------------------
function abrirLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-img");

  img.src = src;
  lightbox.classList.remove("hidden");

  // PUSHSTATE para manejar el botón de back
  history.pushState({ lightbox: true }, "");
}

// Cerrar lightbox
function cerrarLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox.classList.contains("hidden")) {
    lightbox.classList.add("hidden");
    // Volvemos atrás en el historial solo si fue pushState del lightbox
    if (history.state && history.state.lightbox) {
      history.back();
    }
  }
}

// Cerrar al tocar afuera
document.addEventListener("click", e => {
  if (e.target.id === "lightbox") {
    cerrarLightbox();
  }
});

// Manejo del botón físico de back
window.addEventListener("popstate", (e) => {
  const estado = e.state || {};

  vistaActual = estado.vista || "home";
  rubroActivo = estado.rubro || "todos";

  if (estado.comercioId) {
    comercioActivo = comercios.find(c => c.id === estado.comercioId);
  } else {
    comercioActivo = null;
  }

  renderApp();
});

  // ------------------------
  // HISTORIAL
  // ------------------------
    window.addEventListener("popstate", (e) => {
  const estado = e.state || { vista: "home" };

  vistaActual = estado.vista || "home";

  if (vistaActual === "home") {
    rubroActivo = "todos";
    comercioActivo = null;
  }

  if (estado.comercioId) {
    comercioActivo = comercios.find(c => c.id === estado.comercioId);
  }

  renderApp();
});
  // ------------------------
  // DATA
  // ------------------------
  fetch("comercios.json")
    .then(r => r.json())
    .then(data => {
      comercios = data.map(c => {
        if (!c.tipoOperacion || !tiposOperacion.includes(c.tipoOperacion)) {
          c.tipoOperacion = "pedido"; // default
        }
        return c;
      });
      renderHome();
    });

  function renderApp() {
    if (vistaActual === "home") renderHome();
    if (vistaActual === "pedido") renderPedido();
    if (vistaActual === "confirmar") renderConfirmar();
    if (vistaActual === "info") renderInfo();
    if (vistaActual === "reserva") renderReserva();
  }

  // ------------------------
  // HOME
  // ------------------------

function renderHome() {
  vistaActual = "home";
  history.replaceState({ vista: "home" }, "", "#home");

  app.innerHTML = `
    <h1>
      <img src="images/Logo.png" style="width:32px;vertical-align:middle;margin-right:8px;">
      CALCHA
    </h1>
    <p class="subtitulo">El mercado local en tu mano</p>

    <!-- Botón rubros -->
    <button id="btn-rubros">☰</button>

    ${
  menuRubrosAbierto
    ? `
      <div class="acciones">
        <button id="btn-info" class="btn-menu">ℹ️ ¿Qué es Calcha?</button>
        <button id="btn-sumar-comercio" class="btn-menu">➕ Sumar mi comercio</button>
      </div>
    `
    : ""
    }

    <!-- Barra de búsqueda -->
    <div class="buscador">
      <input type="text" id="input-busqueda" placeholder="🔍 Buscar comercio..." autocomplete="off">
      <div id="resultados-busqueda" class="resultados-scroll"></div>
    </div>
<section class="rubros-grid">
  <button class="rubro-btn" data-rubro="gastronomia">
    <span class="icon">🍽️</span>
    <span class="text">Gastronomía</span>
  </button>

  <button class="rubro-btn" data-rubro="turismo">
    <span class="icon">🏨⛰️</span>
    <span class="text">Turismo</span>
  </button>

  <button class="rubro-btn" data-rubro="almacen">
    <span class="icon">🛒</span>
    <span class="text">Almacén</span>
  </button>

  <button class="rubro-btn" data-rubro="servicios">
    <span class="icon">🛠️</span>
    <span class="text">Servicios</span>
  </button>

  <button class="rubro-btn" data-rubro="ropa">
    <span class="icon">🛍️</span>
    <span class="text">Ropa</span>
  </button>

  <button class="rubro-btn" data-rubro="artesanias">
    <span class="icon">🎨</span>
    <span class="text">Artesanías</span>
  </button>
</section>
    <!-- Lista de comercios -->
    <div id="lista-comercios"></div>
  `;

  // ------------------------
  // Botones generales del home
  // ------------------------
  const btnSumar = document.getElementById("btn-sumar-comercio");
  if (btnSumar) btnSumar.onclick = sumarMiComercio;

  document.getElementById("btn-rubros").onclick = () => {
    menuRubrosAbierto = !menuRubrosAbierto;
    renderHome();
  };

  const btnInfo = document.getElementById("btn-info");
  if (btnInfo) {
    btnInfo.onclick = () => {
      vistaActual = "info";
      history.pushState({ vista: "info" }, "", "#info");
      renderInfo();
    };
  }

  document.querySelectorAll("[data-rubro]").forEach(b => {
  b.onclick = () => {
    rubroActivo = b.dataset.rubro;
    menuRubrosAbierto = false;

    history.pushState(
      { vista: "home", rubro: rubroActivo },
      "",
      "#rubro-" + rubroActivo
    );

    renderHome();
  };
});

  // ------------------------
  // Renderizar lista de comercios
  // ------------------------
  const lista = document.getElementById("lista-comercios");
const filtrados = rubroActivo === "todos"
  ? comercios
  : comercios.filter(c => c.rubro === rubroActivo.trim());

  filtrados.forEach(c => {
    const card = document.createElement("div");
    card.className = "card-comercio";
    card.innerHTML = `
      <img src="${c.imagen}" class="comercio-img">
      <h3>${c.nombre}</h3>
      <p>${c.descripcion}</p>
      <button>Ver</button>
    `;

    card.querySelector("button").onclick = () => {
      comercioActivo = c;
      carrito = [];
      tipoEntrega = null;
      direccionEntrega = "";

      switch(c.tipoOperacion) {
        case "pedido":
          vistaActual = "pedido";
          history.pushState({ vista: "pedido", comercioId: c.id }, "", "#pedido");
          renderPedido();
          break;
        case "reserva":
          vistaActual = "reserva";
          history.pushState({ vista: "reserva", comercioId: c.id }, "", "#reserva");
          renderReserva();
          break;
// =========================
// FIREBASE CONFIG
// =========================
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, get, child, update, onValue } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyATdbRLpuMDMj57qtch_B1kZg3sT4jUlUo",
  authDomain: "calcha-delivery.firebaseapp.com",
  databaseURL: "https://calcha-delivery-default-rtdb.firebaseio.com",
  projectId: "calcha-delivery",
  storageBucket: "calcha-delivery.firebasestorage.app",
  messagingSenderId: "272890382291",
  appId: "1:272890382291:web:558aa7c5ac43e914bf1126",
  measurementId: "G-V8F3C7F5JJ"
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const database = getDatabase(firebaseApp);

// =========================
// DELIVERYs - FIREBASE
// =========================

// Función para obtener todos los deliverys
async function cargarDeliverys() {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, 'deliverys'));
  return snapshot.exists() ? snapshot.val() : {};
}

// Función para actualizar disponibilidad
function actualizarDisponibilidad(idDelivery, disponible) {
  const deliveryRef = ref(database, 'deliverys/' + idDelivery);
  update(deliveryRef, { disponible })
    .then(() => console.log(`Delivery ${idDelivery} actualizado: ${disponible}`))
    .catch(err => console.error(err));
}

// Función para renderizar lista de deliverys solo en su sección
async function renderDeliverys(containerId = "delivery-section") {
  const deliverys = await cargarDeliverys();
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = `<h2>Repartidores Disponibles</h2><div class="delivery-list">`;
  Object.keys(deliverys).forEach(id => {
    const d = deliverys[id];
    html += `
      <div class="delivery-item">
        <strong>${d.nombre}</strong> - ${d.telefono} 
        <button data-id="${id}" class="btn-disponible">
          ${d.disponible ? "✅ Disponible" : "❌ No disponible"}
        </button>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;

  // Eventos de botones
  container.querySelectorAll(".btn-disponible").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      actualizarDisponibilidad(id, !deliverys[id].disponible);
    };
  });
}

// Escuchar cambios en tiempo real
const deliveryRef = ref(database, 'deliverys');
onValue(deliveryRef, snapshot => {
  renderDeliverys();
});

// =========================
// CALCHA - MOTOR ORIGINAL
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
  const WHATSAPP_ADMIN = "5493875181644";

  const tiposOperacion = ["pedido", "reserva", "info", "mixto"];
  let vistaActual = "home";
  let comercioActivo = null;
  let carrito = [];
  let tipoEntrega = null;
  let direccionEntrega = "";
  let rubroActivo = "todos";
  let menuRubrosAbierto = false;
  let comercios = [];

  // ------------------------
  // LIGHTBOX GLOBAL
  // ------------------------
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.className = "lightbox hidden";
  const lightboxImg = document.createElement("img");
  lightboxImg.id = "lightbox-img";
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);

  function abrirLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.remove("hidden");
    history.pushState({ lightbox: true }, "");
  }

  function cerrarLightbox() {
    if (!lightbox.classList.contains("hidden")) {
      lightbox.classList.add("hidden");
      if (history.state && history.state.lightbox) history.back();
    }
  }

  document.addEventListener("click", e => {
    if (e.target.id === "lightbox") cerrarLightbox();
  });

  // ------------------------
  // HISTORIAL
  // ------------------------
  window.addEventListener("popstate", (e) => {
    const estado = e.state || { vista: "home" };
    vistaActual = estado.vista || "home";
    rubroActivo = estado.rubro || "todos";
    comercioActivo = estado.comercioId ? comercios.find(c => c.id === estado.comercioId) : null;
    renderApp();
  });

  // ------------------------
  // DATA
  // ------------------------
  fetch("comercios.json")
    .then(r => r.json())
    .then(data => {
      comercios = data.map(c => {
        if (!c.tipoOperacion || !tiposOperacion.includes(c.tipoOperacion)) c.tipoOperacion = "pedido";
        return c;
      });
      renderHome();
    });

  // ------------------------
  // RENDER APP
  // ------------------------
  function renderApp() {
    if (vistaActual === "home") renderHome();
    if (vistaActual === "pedido") renderPedido();
    if (vistaActual === "confirmar") renderConfirmar();
    if (vistaActual === "info") renderInfo();
    if (vistaActual === "reserva") renderReserva();
  }

  // ------------------------
  // HOME
  // ------------------------
  function renderHome() {
    vistaActual = "home";
    history.replaceState({ vista: "home" }, "", "#home");

    app.innerHTML = `
      <h1>
        <img src="images/Logo.png" style="width:32px;vertical-align:middle;margin-right:8px;">
        CALCHA
      </h1>
      <p class="subtitulo">El mercado local en tu mano</p>

      <button id="btn-rubros">☰</button>
      ${
        menuRubrosAbierto ? `
          <div class="acciones">
            <button id="btn-info" class="btn-menu">ℹ️ ¿Qué es Calcha?</button>
            <button id="btn-sumar-comercio" class="btn-menu">➕ Sumar mi comercio</button>
          </div>` : ""
      }

      <div class="buscador">
        <input type="text" id="input-busqueda" placeholder="🔍 Buscar comercio..." autocomplete="off">
        <div id="resultados-busqueda" class="resultados-scroll"></div>
      </div>

      <section class="rubros-grid">
        <button class="rubro-btn" data-rubro="gastronomia"><span class="icon">🍽️</span><span class="text">Gastronomía</span></button>
        <button class="rubro-btn" data-rubro="turismo"><span class="icon">🏨⛰️</span><span class="text">Turismo</span></button>
        <button class="rubro-btn" data-rubro="almacen"><span class="icon">🛒</span><span class="text">Almacén</span></button>
        <button class="rubro-btn" data-rubro="servicios"><span class="icon">🛠️</span><span class="text">Servicios</span></button>
        <button class="rubro-btn" data-rubro="ropa"><span class="icon">🛍️</span><span class="text">Ropa</span></button>
        <button class="rubro-btn" data-rubro="artesanias"><span class="icon">🎨</span><span class="text">Artesanías</span></button>
      </section>

      <div id="lista-comercios"></div>
      <div id="delivery-section"></div>
    `;

    // ------------------------
    // Botones home
    // ------------------------
    const btnSumar = document.getElementById("btn-sumar-comercio");
    if (btnSumar) btnSumar.onclick = () => {
      const mensaje = encodeURIComponent(
        "Hola 👋 Quiero sumar mi comercio a Calcha 🏔️\n\nNombre del comercio:\nRubro:\nDirección:\nTeléfono:\n¿Delivery / Retiro?:"
      );
      window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${mensaje}`, "_blank");
    };

    document.getElementById("btn-rubros").onclick = () => {
      menuRubrosAbierto = !menuRubrosAbierto;
      renderHome();
    };

    const btnInfo = document.getElementById("btn-info");
    if (btnInfo) btnInfo.onclick = () => {
      vistaActual = "info";
      history.pushState({ vista: "info" }, "", "#info");
      renderInfo();
    };

    document.querySelectorAll("[data-rubro]").forEach(b => {
      b.onclick = () => {
        rubroActivo = b.dataset.rubro;
        menuRubrosAbierto = false;
        history.pushState({ vista: "home", rubro: rubroActivo }, "", "#rubro-" + rubroActivo);
        renderHome();
      };
    });

    // ------------------------
    // Lista de comercios
    // ------------------------
    const lista = document.getElementById("lista-comercios");
    const filtrados = rubroActivo === "todos" ? comercios : comercios.filter(c => c.rubro === rubroActivo.trim());
    lista.innerHTML = "";
    filtrados.forEach(c => {
      const card = document.createElement("div");
      card.className = "card-comercio";
      card.innerHTML = `
        <img src="${c.imagen}" class="comercio-img">
        <h3>${c.nombre}</h3>
        <p>${c.descripcion}</p>
        <button>Ver</button>
      `;
      card.querySelector("button").onclick = () => {
        comercioActivo = c;
        carrito = [];
        tipoEntrega = null;
        direccionEntrega = "";
        switch(c.tipoOperacion) {
          case "pedido": vistaActual = "pedido"; history.pushState({ vista: "pedido", comercioId: c.id }, "", "#pedido"); renderPedido(); break;
          case "reserva": vistaActual = "reserva"; history.pushState({ vista: "reserva", comercioId: c.id }, "", "#reserva"); renderReserva(); break;
          case "info": vistaActual = "info"; history.pushState({ vista: "info", comercioId: c.id }, "", "#info"); renderInfoComercio(); break;
          case "mixto": vistaActual = "pedido"; history.pushState({ vista: "pedido", comercioId: c.id }, "", "#pedido"); renderPedido(); break;
        }
      };
      lista.appendChild(card);
    });

    // ------------------------
    // Renderizar deliverys
    // ------------------------
    renderDeliverys();

    // ------------------------
    // Búsqueda
    // ------------------------
    const inputBusqueda = document.getElementById("input-busqueda");
    const resultados = document.getElementById("resultados-busqueda");
    if (inputBusqueda) {
      inputBusqueda.oninput = () => {
        const texto = inputBusqueda.value.trim().toLowerCase();
        resultados.innerHTML = "";
        if (!texto) return;
        const filtrados = comercios.filter(c =>
          c.nombre.toLowerCase().includes(texto) ||
          c.descripcion.toLowerCase().includes(texto) ||
          c.rubro.toLowerCase().includes(texto)
        );
        filtrados.forEach(c => {
          const div = document.createElement("div");
          const regex = new RegExp(`(${texto})`, "gi");
          div.innerHTML = `<strong>${c.nombre.replace(regex, "<span class='resultado-highlight'>$1</span>")}</strong> <small>${c.rubro}</small>`;
          div.className = "resultado-item";
          div.onclick = () => {
            comercioActivo = c;
            carrito = [];
            tipoEntrega = null;
            direccionEntrega = "";
            vistaActual = c.tipoOperacion === "reserva" ? "reserva" :
                         c.tipoOperacion === "info" ? "info" : "pedido";
            history.pushState({ vista: vistaActual, comercioId: c.id }, "", `#${vistaActual}`);
            renderApp();
          };
          resultados.appendChild(div);
        });
      };

      document.addEventListener("click", e => {
        if (!e.target.closest(".buscador")) resultados.innerHTML = "";
      });
    }
  }

  // Función para ir a rubro
  function irARubro(rubro) {
    vistaActual = "home";
    rubroActivo = rubro;
    renderApp();
  }

  
});
  // ------------------------
  // PEDIDO
  // ------------------------
  function renderPedido() {
    if (!comercioActivo) return renderHome();

    let menuHTML = "";
    comercioActivo.menu.forEach((item, i) => {
      const enCarrito = carrito.find(p => p.nombre === item.nombre);
      menuHTML += `
        <div class="item-menu">
          <span>${item.nombre} - $${item.precio}</span>
          <div>
            ${enCarrito ? `<button data-i="${i}" data-a="restar">−</button>
            <strong>${enCarrito.cantidad}</strong>` : ""}
            <button data-i="${i}" data-a="sumar">+</button>
          </div>
        </div>
      `;
    });

    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>

      <img src="${comercioActivo.imagen}" class="comercio-img">

      <h2>${comercioActivo.nombre}</h2>
      <p>${comercioActivo.descripcion}</p>

      ${
        comercioActivo.galeria && comercioActivo.galeria.length > 0
          ? `<div class="galeria-comercio">
              ${comercioActivo.galeria.map(img => `<img src="${img}" class="galeria-img">`).join("")}
            </div>`
          : ""
      }

      <div class="menu">${menuHTML}</div>

      <h3>Entrega</h3>
      <div class="entrega">
        <button id="retiro" class="${tipoEntrega === "retiro" ? "activo" : ""}">🏠 Retiro</button>
        ${
          comercioActivo.permiteDelivery
            ? `<button id="delivery" class="${tipoEntrega === "delivery" ? "activo" : ""}">🛵 Delivery</button>`
            : ""
        }
      </div>

      ${
        tipoEntrega === "delivery"
          ? `<input id="direccion" placeholder="Dirección" value="${direccionEntrega}">`
          : ""
      }

      <div class="carrito">
        <strong>Total: $${total}</strong>
        <button class="btn-continuar" ${!total || !tipoEntrega ? "disabled" : ""} id="continuar">
          Continuar
        </button>
      </div>
    `;

    // ------------------------
    // Eventos
    // ------------------------
    document.querySelector(".btn-volver").onclick = () => history.back();

    document.querySelectorAll("[data-a]").forEach(b => {
      b.onclick = () => {
        const prod = comercioActivo.menu[b.dataset.i];
        const ex = carrito.find(p => p.nombre === prod.nombre);
        if (b.dataset.a === "sumar") {
          if (ex) ex.cantidad++;
          else carrito.push({ ...prod, cantidad: 1 });
        }
        if (b.dataset.a === "restar" && ex) {
          ex.cantidad--;
          if (ex.cantidad === 0) carrito = carrito.filter(p => p !== ex);
        }
        renderPedido();
      };
    });

    document.getElementById("retiro").onclick = () => {
      tipoEntrega = "retiro";
      direccionEntrega = "";
      renderPedido();
    };

    const btnDel = document.getElementById("delivery");
    if (btnDel) {
      btnDel.onclick = () => {
        tipoEntrega = "delivery";
        renderPedido();
      };
    }

    const dir = document.getElementById("direccion");
    if (dir) dir.oninput = e => direccionEntrega = e.target.value;

    document.getElementById("continuar").onclick = () => {
      vistaActual = "confirmar";
      history.pushState({ vista: "confirmar" }, "", "#confirmar");
      renderConfirmar();
    };

    // ------------------------
    // Lightbox: hacer clic en miniaturas
    // ------------------------
    document.querySelectorAll(".galeria-img").forEach(img => {
      img.addEventListener("click", () => abrirLightbox(img.src));
    });
  }

  // ------------------------
  // CONFIRMAR
  // ------------------------
  function renderConfirmar() {
    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);

    let resumen = carrito.map(p =>
      `<div class="item-confirmacion">
        <span>${p.nombre} x${p.cantidad}</span>
        <span>$${p.precio * p.cantidad}</span>
      </div>`
    ).join("");

    let msg = `🛒 Pedido - ${comercioActivo.nombre}\n`;
    carrito.forEach(p => msg += `• ${p.nombre} x${p.cantidad}\n`);
    msg += `\nTotal: $${total}\nEntrega: ${tipoEntrega}`;
    if (tipoEntrega === "delivery") msg += `\nDirección: ${direccionEntrega}`;

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>Confirmar pedido</h2>

      <div class="resumen">${resumen}</div>

      <h3>Total: $${total}</h3>

      <button class="btn-confirmar"
        onclick="window.open('https://wa.me/54${comercioActivo.whatsapp}?text=${encodeURIComponent(msg)}','_blank')">
        Enviar por WhatsApp
      </button>
    `;

    document.querySelector(".btn-volver").onclick = () => history.back();
  }

  // ------------------------
  // INFO
  // ------------------------
  function renderInfo() {
    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>🌵 ¿Qué es Calcha?</h2>
      <p>Conecta comercios locales con personas de la zona, sin intermediarios.</p>
    `;
    document.querySelector(".btn-volver").onclick = () => history.back();
  }

  // ------------------------
  // NUEVAS VISTAS
  // ------------------------
  function renderReserva() {
    if (!comercioActivo) return renderHome();

    const urlReserva = comercioActivo.urlReserva ||
      `https://wa.me/54${comercioActivo.whatsapp}?text=${encodeURIComponent("Hola, quiero reservar")}`;

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <img src="${comercioActivo.imagen}" class="comercio-img">
      <h2>${comercioActivo.nombre}</h2>
      <p>${comercioActivo.descripcion}</p>

      ${
        comercioActivo.galeria && comercioActivo.galeria.length > 0
          ? `<div class="galeria-comercio">
              ${comercioActivo.galeria.map(img => `<img src="${img}" class="galeria-img">`).join("")}
            </div>`
          : ""
      }

      <button onclick="window.open('${urlReserva}','_blank')">📅 Reservar</button>
      <button onclick="window.open('https://wa.me/54${comercioActivo.whatsapp}','_blank')">💬 Contactar</button>
    `;

    document.querySelector(".btn-volver").onclick = () => history.back();

    // Agregar evento lightbox
    document.querySelectorAll(".galeria-img").forEach(img => {
      img.addEventListener("click", () => abrirLightbox(img.src));
    });
  }

  function renderInfoComercio() {
    if (!comercioActivo) return renderHome();

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <img src="${comercioActivo.imagen}" class="comercio-img">
      <h2>${comercioActivo.nombre}</h2>
      <p>${comercioActivo.descripcion}</p>

      ${
        comercioActivo.galeria && comercioActivo.galeria.length > 0
          ? `<div class="galeria-comercio">
              ${comercioActivo.galeria.map(img => `<img src="${img}" class="galeria-img">`).join("")}
            </div>`
          : ""
      }

      <button onclick="window.open('https://wa.me/54${comercioActivo.whatsapp}','_blank')">💬 Contactar</button>
    `;

    document.querySelector(".btn-volver").onclick = () => history.back();

    // Agregar evento lightbox
    document.querySelectorAll(".galeria-img").forEach(img => {
      img.addEventListener("click", () => abrirLightbox(img.src));
    });
  }

});
