// =========================
// CALCHA APP - JS COMPLETO
// =========================

// -------------------------
// ESTADO GLOBAL
// -------------------------
let vistaActual = "home";
let ubicacionActiva = null;
let rubroActivo = "todos";
let comercioActivo = null;

let carrito = [];
let tipoEntrega = null;
let direccionEntrega = "";

let menuRubrosAbierto = false;
let comercios = [];
let app;

// -------------------------
// DOM READY
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");

  const WHATSAPP_ADMIN = "5493875181644";
  const tiposOperacion = ["pedido", "reserva", "info", "mixto"];

  // -------------------------
  // BOTÓN SUMAR COMERCIO
  // -------------------------
  function sumarMiComercio() {
    const mensaje = encodeURIComponent(
      "Hola 👋 Quiero sumar mi comercio a Calcha 🏔️\n\n" +
      "Nombre del comercio:\nRubro:\nDirección:\nTeléfono:\n¿Delivery / Retiro?:"
    );
    window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${mensaje}`, "_blank");
  }

  // -------------------------
  // LIGHTBOX
  // -------------------------
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox";
  lightbox.className = "lightbox hidden";
  lightbox.innerHTML = `<img id="lightbox-img">`;
  document.body.appendChild(lightbox);

  function abrirLightbox(src) {
    document.getElementById("lightbox-img").src = src;
    lightbox.classList.remove("hidden");
    history.pushState({ lightbox: true }, "");
  }

  function cerrarLightbox() {
    if (!lightbox.classList.contains("hidden")) {
      lightbox.classList.add("hidden");
    }
  }

  window.abrirLightbox = abrirLightbox;

  lightbox.addEventListener("click", cerrarLightbox);

  // -------------------------
  // HISTORIAL
  // -------------------------
  window.addEventListener("popstate", (e) => {
    const estado = e.state || {};

    if (estado.lightbox) {
      cerrarLightbox();
      return;
    }

    if (estado.menu) {
      menuRubrosAbierto = false;
      renderHome();
      return;
    }

    vistaActual = estado.vista || "home";
    ubicacionActiva = estado.ubicacion ?? ubicacionActiva;
    rubroActivo = estado.rubro ?? rubroActivo;

    if (estado.comercioId) {
      comercioActivo = comercios.find(c => c.id === estado.comercioId);
    } else {
      comercioActivo = null;
    }

    renderApp();
  });

  // -------------------------
  // RENDER APP
  // -------------------------
  function renderApp() {
    if (vistaActual === "home") renderHome();
    if (vistaActual === "pedido") renderPedido();
    if (vistaActual === "confirmar") renderConfirmar();
    if (vistaActual === "info") renderInfo();
    if (vistaActual === "reserva") renderReserva();
  }

  window.renderApp = renderApp;

  // -------------------------
  // DATA
  // -------------------------
  fetch("comercios.json")
    .then(r => r.json())
    .then(data => {
      comercios = data.map(c => {
        if (!c.tipoOperacion || !tiposOperacion.includes(c.tipoOperacion)) {
          c.tipoOperacion = "pedido";
        }
        return c;
      });
      renderHome();
    });

  // =========================
  // HOME
  // =========================
  function renderHome() {
    vistaActual = "home";
    history.replaceState({ vista: "home" }, "", "#home");

    app.innerHTML = `
      <h1>CALCHA</h1>
      <p class="subtitulo">El mercado local en tu mano</p>

      <button id="btn-menu">☰</button>

      ${menuRubrosAbierto ? `
        <div class="acciones">
          <button id="btn-info" class="btn-menu">ℹ️ ¿Qué es Calcha?</button>
          <button id="btn-sumar" class="btn-menu">➕ Sumar mi comercio</button>
        </div>` : ""}

      <div id="selector-ubicacion"></div>

      <div class="rubros-grid">
        <button class="rubro-btn" data-rubro="gastronomia">🍽️ Gastronomía</button>
        <button class="rubro-btn" data-rubro="turismo">🏨 Turismo</button>
        <button class="rubro-btn" data-rubro="almacen">🛒 Almacén</button>
        <button class="rubro-btn" data-rubro="servicios">🛠️ Servicios</button>
      </div>

      <div id="lista-comercios"></div>
    `;

    document.getElementById("btn-menu").onclick = () => {
      menuRubrosAbierto = !menuRubrosAbierto;
      history.pushState({ menu: true }, "");
      renderHome();
    };

    const btnSumar = document.getElementById("btn-sumar");
    if (btnSumar) btnSumar.onclick = sumarMiComercio;

    const btnInfo = document.getElementById("btn-info");
    if (btnInfo) btnInfo.onclick = () => {
      vistaActual = "info";
      history.pushState({ vista: "info" }, "", "#info");
      renderInfo();
    };

    document.querySelectorAll("[data-rubro]").forEach(b => {
      b.onclick = () => {
        rubroActivo = b.dataset.rubro;
        history.pushState({ vista: "home", rubro: rubroActivo }, "");
        renderHome();
      };
    });

    renderSelectorUbicacion();
    renderListaComercios();
  }

  // -------------------------
  // LISTA COMERCIOS
  // -------------------------
  function renderListaComercios() {
    const lista = document.getElementById("lista-comercios");
    lista.innerHTML = "";

    obtenerComerciosVisibles().forEach(c => {
      const div = document.createElement("div");
      div.className = "card-comercio";
      div.innerHTML = `
        <img src="${c.imagen}">
        <h3>${c.nombre}</h3>
        <p>${c.descripcion}</p>
        <button>Ver</button>
      `;

      div.querySelector("button").onclick = () => {
        comercioActivo = c;
        vistaActual = c.tipoOperacion === "reserva" ? "reserva" : "pedido";
        history.pushState({ vista: vistaActual, comercioId: c.id }, "");
        renderApp();
      };

      lista.appendChild(div);
    });
  }

  // -------------------------
  // UBICACIONES
  // -------------------------
  function renderSelectorUbicacion() {
    const cont = document.getElementById("selector-ubicacion");
    cont.innerHTML = `
      <div class="ubicaciones">
        <button data-ubi="cafayate">📍 Cafayate</button>
        <button data-ubi="santa maria">📍 Santa María</button>
        <button data-ubi="amaicha">📍 Amaicha</button>
      </div>
    `;

    cont.querySelectorAll("button").forEach(b => {
      b.onclick = () => {
        ubicacionActiva = b.dataset.ubi;
        history.pushState({ vista: "home", ubicacion: ubicacionActiva }, "");
        renderHome();
      };
    });
  }

  function obtenerComerciosVisibles() {
    return comercios.filter(c => {
      if (rubroActivo !== "todos" && c.rubro !== rubroActivo) return false;
      if (ubicacionActiva && c.ubicacion !== ubicacionActiva) return false;
      return true;
    });
  }

  // -------------------------
  // PEDIDO
  // -------------------------
  function renderPedido() {
    if (!comercioActivo) return renderHome();

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>${comercioActivo.nombre}</h2>

      <div class="galeria-comercio">
        ${(comercioActivo.galeria || []).map(i =>
          `<img src="${i}" class="galeria-img">`).join("")}
      </div>
    `;

    document.querySelector(".btn-volver").onclick = () => history.back();
    document.querySelectorAll(".galeria-img")
      .forEach(img => img.onclick = () => abrirLightbox(img.src));
  }

  // -------------------------
  // CONFIRMAR
  // -------------------------
  function renderConfirmar() {
    app.innerHTML = `<button class="btn-volver">← Volver</button>`;
    document.querySelector(".btn-volver").onclick = () => history.back();
  }

  // -------------------------
  // INFO
  // -------------------------
  function renderInfo() {
    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>¿Qué es Calcha?</h2>
      <p>Conecta comercios locales con personas de la zona.</p>
    `;
    document.querySelector(".btn-volver").onclick = () => history.back();
  }

  // -------------------------
  // RESERVA
  // -------------------------
  function renderReserva() {
    if (!comercioActivo) return renderHome();
    renderPedido();
  }
});

// =========================
// BOTÓN HOME GLOBAL 🏠
// =========================
function volverHome() {
  vistaActual = "home";
  ubicacionActiva = null;
  rubroActivo = "todos";
  comercioActivo = null;
  menuRubrosAbierto = false;
  window.renderApp();
}
