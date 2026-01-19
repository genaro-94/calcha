// =========================
// CALCHA - MOTOR COMPLETO (RESTAURADO)
// =========================


// =========================
// ESTADO GLOBAL (NECESARIO PARA BOTÓN HOME)
// =========================

let vistaActual = "home";
let ubicacionActiva = null;   // "cafayate" | "santa-maria" | "amaicha" | null
let rubroActivo = "todos";   // "todos" | "pizzerias" | "hoteleria" | etc
let comercioActivo = null;

let carrito = [];
let tipoEntrega = null;
let direccionEntrega = "";

let menuRubrosAbierto = false;
let comercios = [];
let app;

// =========================
// DOM READY
// =========================

document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
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

  

  // ------------------------
  // LIGHTBOX MEJORADO
  // ------------------------

  function abrirLightbox(src) {
    const img = document.getElementById("lightbox-img");
    img.src = src;
    lightbox.classList.remove("hidden");
    history.pushState({ lightbox: true }, "");
  }

  function cerrarLightbox() {
    if (!lightbox.classList.contains("hidden")) {
      lightbox.classList.add("hidden");
      if (history.state && history.state.lightbox) {
        history.back();
      }
    }
  }
window.abrirLightbox = abrirLightbox;
window.cerrarLightbox = cerrarLightbox;
  
  document.addEventListener("click", e => {
    if (e.target.id === "lightbox") {
      cerrarLightbox();
    }
  });

  // ------------------------
  // HISTORIAL
  // ------------------------

  window.addEventListener("popstate", (e) => {
    const estado = e.state || { vista: "home" };
    
if (estado && estado.lightbox) {
  cerrarLightbox();
  return;
}
    vistaActual = estado.vista || "home";

    if (vistaActual === "home") {
      rubroActivo = "todos";
      comercioActivo = null;
    }

    if (estado.comercioId) {
      comercioActivo = comercios.find(c => c.id === estado.comercioId);
    }
if (estado.ubicacion !== undefined) {
  ubicacionActiva = estado.ubicacion;
}

if (estado.rubro !== undefined) {
  rubroActivo = estado.rubro;
}
    renderApp();
  });
  function renderApp() {
    if (vistaActual === "home") renderHome();  
    if (vistaActual === "pedido") renderPedido();
    if (vistaActual === "confirmar") renderConfirmar();
    if (vistaActual === "info") renderInfo();
    if (vistaActual === "reserva") renderReserva();
  }

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
  window.renderApp = renderApp;

  renderApp();
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
 <div id="selector-ubicacion"></div>
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
renderSelectorUbicacion();
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
lista.innerHTML = "";
const filtrados = obtenerComerciosVisibles();

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
        case "info":
          vistaActual = "info";
          history.pushState({ vista: "info", comercioId: c.id }, "", "#info");
          renderInfoComercio();
          break;
        case "mixto":
          vistaActual = "pedido";
          history.pushState({ vista: "pedido", comercioId: c.id }, "", "#pedido");
          renderPedido();
          break;
      }
    };

    lista.appendChild(card);
  });

  // ------------------------
  // Autocomplete / Búsqueda con scroll tipo TikTok/Instagram
  // ------------------------
  const inputBusqueda = document.getElementById("input-busqueda");
  const resultados = document.getElementById("resultados-busqueda");

  if (inputBusqueda) {
    inputBusqueda.oninput = () => {
      const texto = inputBusqueda.value.trim().toLowerCase();
      resultados.innerHTML = "";

      if (texto === "") return;
     const lista = document.getElementById("lista-comercios");
     lista.innerHTML = "";
      const filtrados = obtenerComerciosVisibles().filter(c =>
  c.nombre.toLowerCase().includes(texto) ||
  c.descripcion.toLowerCase().includes(texto)
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

    // Cerrar resultados si haces click fuera
    document.addEventListener("click", e => {
      if (!e.target.closest(".buscador")) {
        resultados.innerHTML = "";
      }
    });
  }
}

function irARubro(rubro) {
  history.pushState(
    { vista: "home" },
    "",
    ""
  );

  vistaActual = "home";
  rubroActivo = rubro;

  renderApp();
}
  // ------------------------
// UBICACIÓN ACTIVA
// ------------------------
function setUbicacion(ubi) {
  ubicacionActiva = ubi;

  document.querySelectorAll(".ubi-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.ubi === ubi);
  });

  history.pushState(
    { vista: "home", ubicacion: ubi },
    "",
    "#ubicacion-" + ubi
  );

  renderHome();
}
  function obtenerComerciosVisibles() {
  let lista = comercios;

  // Filtro por rubro
  if (rubroActivo && rubroActivo !== "todos") {
    lista = lista.filter(c => c.rubro === rubroActivo);
  }
// 🔹 Filtro por ubicación
  if (ubicacionActiva) {
    lista = lista.filter(c => c.ubicacion === ubicacionActiva);
  }
  return lista;
  }

  // =========================
// SELECTOR DE UBICACIÓN
// =========================
function renderSelectorUbicacion() {
  const cont = document.getElementById("selector-ubicacion");
  if (!cont) return;

  cont.innerHTML = `
    <div class="ubicaciones">
      <button class="ubi-btn" data-ubi="cafayate">📍 Cafayate</button>
      <button class="ubi-btn" data-ubi="santa maria">📍 Santa María</button>
      <button class="ubi-btn" data-ubi="amaicha">📍 Amaicha</button>
    </div>
  `;

  document.querySelectorAll(".ubi-btn").forEach(btn => {
    btn.onclick = () => setUbicacion(btn.dataset.ubi);
  });
}
  // ------------------------
  // PEDIDO
  // ------------------------
  function renderPedido() {
    if (!comercioActivo) return renderHome();

  let menuHTML = "";
let categoriaActual = "";

comercioActivo.menu.forEach((item, i) => {
  if (item.categoria !== categoriaActual) {
    categoriaActual = item.categoria;
    menuHTML += `
      <div class="menu-categoria">
        ${categoriaActual}
      </div>
    `;
  }

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
