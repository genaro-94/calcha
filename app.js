// =========================
// CALCHA - MOTOR COMPLETO (REORGANIZADO)
// =========================


// =========================
// ESTADO GLOBAL
// =========================

let vistaActual = "home";
let ubicacionActiva = null;
let rubroActivo = "todos";
let comercioActivo = null;

let carrito = [];
let tipoEntrega = null;
let direccionEntrega = "";

let comercios = [];
let app = null;
let lightbox;

const WHATSAPP_ADMIN = "5493875181644";
const tiposOperacion = ["pedido", "reserva", "info", "mixto"];


// =========================
// INIT APP
// =========================

document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");

  crearLightbox();
  cargarComercios();
  manejarBackButton();

  history.replaceState({ vista: "home" }, "", "#home");
  renderApp();
});


// =========================
// ROUTER CENTRAL
// =========================

function renderApp() {
  switch (vistaActual) {
    case "home": renderHome(); break;
    case "menu": renderMenu(); break;
    case "pedido": renderPedido(); break;
    case "confirmar": renderConfirmar(); break;
    case "info": renderInfo(); break;
    case "reserva": renderReserva(); break;
    case "infoComercio": renderInfoComercio(); break;
    default: renderHome();
  }
}

window.renderApp = renderApp;


// =========================
// HISTORIAL / BACK FÍSICO
// =========================
function manejarBackButton() {
  window.addEventListener("popstate", e => {
    const s = e.state || { vista: "home" };

    // 👇 PRIORIDAD LIGHTBOX
    if (s.lightbox) {
      cerrarLightbox();
      return;
    }

    vistaActual = s.vista || "home";
    rubroActivo = s.rubro ?? rubroActivo;
    ubicacionActiva = s.ubicacion ?? ubicacionActiva;

    if (s.comercioId) {
      comercioActivo = comercios.find(c => c.id === s.comercioId) || null;
    } else {
      comercioActivo = null;
    }

    renderApp();
  });
}

// =========================
// DATA
// =========================

function cargarComercios() {
  fetch("comercios.json")
    .then(r => r.json())
    .then(data => {
      comercios = data.map(c => {
        if (!tiposOperacion.includes(c.tipoOperacion)) {
          c.tipoOperacion = "pedido";
        }
        return c;
      });
      renderHome();
    });
}


// =========================
// HOME
// =========================

function renderHome() {
  vistaActual = "home";

  app.innerHTML = `
    <h1>CALCHA</h1>
    <p class="subtitulo">El mercado local en tu mano</p>

    <button id="btn-menu">☰</button>

    <div id="selector-ubicacion"></div>

    <div class="buscador">
      <input id="input-busqueda" placeholder="🔍 Buscar comercio">
      <div id="resultados-busqueda"></div>
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
    <span class="icon">🚕🛠️</span>
    <span class="text">Servicios</span>
  </button>

  <button class="rubro-btn" data-rubro="ropa">
    <span class="icon">🛍️💍</span>
    <span class="text">Ropa y accesorios</span>
  </button>

  <button class="rubro-btn" data-rubro="todos">
  <span class="icon">🎨👟🍔</span>
  <span class="text">Todos</span>
</button>
<button class="rubro-btn" data-rubro="motodelivery">
  <span class="icon">🛵🚲</span>
  <span class="text">Delivery</span>
</button>
</section>

    <div id="lista-comercios"
    class="lista-comercios"></div>
  `;
const subtitulo = app.querySelector(".subtitulo");

if (subtitulo && rubroActivo === "motodelivery") {
  subtitulo.innerText =
    "Moto delivery particulares – coordiná directo con el conductor";
}
  document.getElementById("btn-menu").onclick = () => {
    vistaActual = "menu";
    history.pushState({ vista: "menu" }, "", "#menu");
    renderMenu();
  };

  renderSelectorUbicacion();
  renderListaComercios();
  activarBusqueda();
  activarRubros();
  activarUbicaciones();
  crearLightbox(); 
  activarGaleria();
}


// =========================
// MENÚ
// =========================

function renderMenu() {
  app.innerHTML = `
    <button class="btn-volver">←</button>
    <button class="btn-home">🏠</button>

    <button id="btn-info">ℹ️ ¿Qué es Calcha?</button>
    <button id="btn-sumar">➕ Sumar comercio</button>
  `;

  document.querySelector(".btn-volver").onclick = () => history.back();
  document.querySelector(".btn-home").onclick = volverHome;

  document.getElementById("btn-info").onclick = () => {
    vistaActual = "info";
    history.pushState({ vista: "info" }, "", "#info");
    renderInfo();
  };

  document.getElementById("btn-sumar").onclick = sumarMiComercio;
}


// =========================
// LISTA COMERCIOS
// =========================

function renderListaComercios() {
  const lista = document.getElementById("lista-comercios");
  lista.innerHTML = "";

  obtenerComerciosVisibles().forEach(c => {
  const card = document.createElement("div");
card.className = "card-comercio";

card.innerHTML = `
  <img src="${c.imagen}" alt="${c.nombre}">
  <div class="info">
    <h3>${c.nombre}</h3>
    <p>${c.descripcion}</p>
    <button>Ver</button>
  </div>
`;

    card.querySelector("button").onclick = () => {
      comercioActivo = c;
      carrito = [];
      tipoEntrega = null;
      direccionEntrega = "";

      vistaActual = c.tipoOperacion === "reserva" ? "reserva" :
                    c.tipoOperacion === "info" ? "infoComercio" : "pedido";

      history.pushState(
        { vista: vistaActual, comercioId: c.id },
        "",
        "#" + vistaActual
      );

      renderApp();
    };

    lista.appendChild(card);
  });
}


// =========================
// FILTROS
// =========================

function activarRubros() {
  document.querySelectorAll("[data-rubro]").forEach(b => {
    b.onclick = () => {
      rubroActivo = b.dataset.rubro;
      history.pushState(
        { vista: "home", rubro: rubroActivo },
        "",
        "#rubro-" + rubroActivo
      );
      renderHome();
    };
  });
}

function obtenerComerciosVisibles() {
  let lista = comercios;

  // 1️⃣ Ocultar moto delivery en el home general
  if (!rubroActivo || rubroActivo === "todos") {
    lista = lista.filter(c => c.rubro !== "motodelivery");
  }

  // 2️⃣ Filtrar por rubro
  if (rubroActivo && rubroActivo !== "todos") {
    lista = lista.filter(c => c.rubro === rubroActivo);
  }

  // 3️⃣ Filtrar por ubicación (CLAVE)
  if (ubicacionActiva) {
    lista = lista.filter(c => c.ubicacion === ubicacionActiva);
  }

  return lista;
}

// =========================
// UBICACIÓN
// =========================

function renderSelectorUbicacion() {
  const cont = document.getElementById("selector-ubicacion");
  cont.innerHTML = `
      <div class="ubicaciones">
      <button class="ubi-btn" data-ubi="cafayate">📍 cafayate</button>
      <button class="ubi-btn" data-ubi="santa maria">📍 Santa María</button>
      <button class="ubi-btn" data-ubi="amaicha">📍 Amaicha</button>
    </div>
  `;
}

function setUbicacion(ubi) {
  ubicacionActiva = ubi;
  history.pushState(
    { vista: "home", ubicacion: ubi },
    "",
    "#ubicacion-" + ubi
  );
  renderHome();
}

function activarUbicaciones() {
  document.querySelectorAll("[data-ubi]").forEach(btn => {
    btn.onclick = () => {
      setUbicacion(btn.dataset.ubi);
    };
  });
}

// =========================
// BOTÓN HOME
// =========================

function volverHome() {
  vistaActual = "home";
  rubroActivo = "todos";
  ubicacionActiva = null;
  comercioActivo = null;

  history.pushState({ vista: "home" }, "", "#home");
  renderHome();
}


// =========================
// INFO
// =========================

function renderInfo() {
  app.innerHTML = `
    <button class="btn-volver">←</button>
    <h2>¿Qué es Calcha?</h2>
    <p>Calcha es una plataforma que conecta personas con comercios y servicios
    locales. No realiza pagos ni interviene en acuerdos entre las partes.
  </p>

  <p>
    Los pedidos, reservas o contactos se coordinan directamente entre usuarios
    y comercios o prestadores de servicios.
  </p>

  <button id="btn-terminos" class="btn-secundario">
    📄 Términos y Condiciones
  </button>

  <div id="terminos-container" class="terminos oculto">
    <!-- ACÁ VAN LOS TÉRMINOS -->
    <h3>Términos y Condiciones</h3>

    <p>
      Calcha es una plataforma de contacto que permite a los usuarios encontrar
      comercios y prestadores de servicios locales.
    </p>

    <p>
      Calcha no participa en pagos, entregas ni acuerdos entre las partes.
    </p>

    <p>
      El uso de la plataforma implica la aceptación de estos términos.
    </p>
    <!-- pegás acá el texto completo que ya tenés -->
  </div>
`;
  document.querySelector(".btn-volver").onclick = () => history.back();
}


// =========================
// RESERVA / INFO COMERCIO
// =========================

function renderReserva() {
  if (!comercioActivo) return volverHome();

  const urlReserva = comercioActivo.urlReserva ||
    `https://wa.me/54${comercioActivo.whatsapp}?text=${encodeURIComponent("Hola, quiero reservar")}`;

  app.innerHTML = `
    <button class="btn-volver">← Volver</button>
    <img src="${comercioActivo.imagen}" class="comercio-img">
    <h2>${comercioActivo.nombre}</h2>
    <p>${comercioActivo.descripcion}</p>

   ${comercioActivo.galerias
  ? Object.entries(comercioActivo.galerias).map(([categoria, fotos]) => `
      <h3>${categoria}</h3>
      <div class="galeria-comercio">
        ${fotos.map(img => `<img src="${img}" class="galeria-img">`).join("")}
      </div>
    `).join("")
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
  if (!comercioActivo) return volverHome();

  app.innerHTML = `
    <button class="btn-volver">← Volver</button>
    <img src="${comercioActivo.imagen}" class="comercio-img">
    <h2>${comercioActivo.nombre}</h2>
    <p>${comercioActivo.descripcion}</p>

${comercioActivo.galerias
  ? Object.entries(comercioActivo.galerias).map(([categoria, fotos]) => `
      <h3>${categoria}</h3>
      <div class="galeria-comercio">
        ${fotos.map(img => `<img src="${img}" class="galeria-img">`).join("")}
      </div>
    `).join("")
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


// =========================
// PEDIDO / CONFIRMAR
// =========================

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

      <img src="${comercioActivo.imagen}"
      class="comercio-portada">

      <h2>${comercioActivo.nombre}</h2>
      <p>${comercioActivo.descripcion}</p>

${comercioActivo.galerias
  ? Object.entries(comercioActivo.galerias).map(([categoria, fotos]) => `
      <h3>${categoria}</h3>
      <div class="galeria-comercio">
        ${fotos.map(img => `<img src="${img}" class="galeria-img">`).join("")}
      </div>
    `).join("")
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


// =========================
// BÚSQUEDA
// =========================

function activarBusqueda() {
  const input = document.getElementById("input-busqueda");
  const resultados = document.getElementById("resultados-busqueda");

  input.oninput = () => {
    const t = input.value.toLowerCase();
    resultados.innerHTML = "";

    if (!t) return;

    obtenerComerciosVisibles()
      .filter(c => c.nombre.toLowerCase().includes(t))
      .forEach(c => {
        const d = document.createElement("div");
        d.textContent = c.nombre;
        d.onclick = () => {
          comercioActivo = c;
          vistaActual = "pedido";
          history.pushState({ vista: "pedido", comercioId: c.id }, "", "#pedido");
          renderPedido();
        };
        resultados.appendChild(d);
      });
  };
}



// =========================
// LIGHTBOX COMPLETO
// =========================

function crearLightbox() {
  if (document.getElementById("lightbox")) return;

  const div = document.createElement("div");
  div.id = "lightbox";
  div.className = "lightbox hidden"; // se marca como lightbox y hidden
  div.innerHTML = `<img id="lightbox-img">`;
  document.body.appendChild(div);

  lightbox = div;
}

// Abrir imagen en lightbox
function abrirLightbox(src) {
  const img = document.getElementById("lightbox-img");
  img.src = src;
  lightbox.classList.remove("hidden");
  history.pushState({ lightbox: true }, ""); // agrega al historial
}

// Cerrar lightbox
function cerrarLightbox() {
  if (!lightbox.classList.contains("hidden")) {
    lightbox.classList.add("hidden");
    if (history.state && history.state.lightbox) {
      history.back(); // vuelve atrás en historial solo si estaba en lightbox
    }
  }
}

// Click fuera de la imagen
document.addEventListener("click", e => {
  if (e.target.id === "lightbox") {
    cerrarLightbox();
  }
});

// Back físico / historial
window.addEventListener("popstate", e => {
  if (!lightbox.classList.contains("hidden")) {
    cerrarLightbox(); // cierra lightbox antes de ir al historial anterior
  } else {
    // aquí va tu manejo de back normal para vistas (home, pedido, etc.)
    const s = e.state || { vista: "home" };
    vistaActual = s.vista || "home";
    rubroActivo = s.rubro ?? rubroActivo;
    ubicacionActiva = s.ubicacion ?? ubicacionActiva;
    if (s.comercioId) {
      comercioActivo = comercios.find(c => c.id === s.comercioId) || null;
    } else {
      comercioActivo = null;
    }
    renderApp();
  }
});

// Activar click en galería
function activarGaleria() {
  document.querySelectorAll(".galeria-img").forEach(img => {
    img.onclick = () => abrirLightbox(img.src);
  });
}
// =========================
// UTIL
// =========================

function sumarMiComercio() {
  const msg = encodeURIComponent("Hola! Quiero sumar mi comercio a Calcha");
  window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${msg}`, "_blank");
    }
