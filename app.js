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

    // 🔥 PRIORIDAD ABSOLUTA: lightbox abierto
    if (lightboxDiv && lightboxDiv.style.display === "flex") {
      cerrarLightbox(false); // false = NO tocar history
      return;
    }

    // 👉 navegación normal
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
  <div class="home-header">
      <img src="images/Logo.png" alt="Calcha" class="logo-calcha">
    <div class="header-logo">
  <img src="images/calcha1.png" alt="Calcha Market" />
</div>
    <button id="btn-menu">☰</button>

    <div id="selector-ubicacion"></div>

    <div class="buscador">
      <input id="input-busqueda" placeholder="🔍 Buscar comercio">
      <div id="resultados-busqueda"></div>
    </div>
<section class="acciones-fijas">
  <button class="accion-btn" data-rubro="todos">
    <img src="images/todos.png" alt="Todos">
  </button>

  <button class="accion-btn" data-rubro="motodelivery">
    <img src="images/delivery.png" alt="Delivery y envíos">
  </button>
</section>

<div class="rubros-wrapper">
  <section class="rubros-grid">

    <button class="rubro-btn" data-rubro="gastronomia">
      <img src="images/gastronomia.png" alt="Gastronomía">
    </button>

    <button class="rubro-btn" data-rubro="turismo">
      <img src="images/turismo.png" alt="Turismo">
    </button>

    <button class="rubro-btn" data-rubro="almacen">
      <img src="images/almacen.png" alt="Almacén">
    </button>

    <button class="rubro-btn" data-rubro="servicios">
      <img src="images/servicios.png" alt="Servicios">
    </button>

    <button class="rubro-btn" data-rubro="ropa">
      <img src="images/ropa.png" alt="Ropa y accesorios">
    </button>
  </section>
</div>

<div id="mensaje-rubro" class="mensaje-rubro"></div>
    <div id="lista-comercios"
    class="lista-comercios"></div>
  `;
const mensajeRubro = document.getElementById("mensaje-rubro");

if (mensajeRubro) {
  mensajeRubro.innerHTML = "";

  if (rubroActivo === "motodelivery") {
    mensajeRubro.innerText =
      `🛵 deliverys y servicios de paqueteria particulares – coordiná directo con el conductor
📦 Para mayor tranquilidad, sugerimos solicitar la ubicación en tiempo real por WhatsApp`;
  }
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
  ; 
  activarGaleria();
}


// =========================
// MENÚ
// =========================

function renderMenu() {
  app.innerHTML = `
    <button class="btn-volver">←</button>
    

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
  if (vistaActual === "home") {
    // 👉 ya estás en home → subir arriba
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    return;
  }

  // 👉 no estás en home → volver a home
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
<button class="btn-volver" onclick="volver()">←</button>
  <h2>ℹ️ ¿Qué es Calcha?</h2>

  <p>
    Calcha es una plataforma que conecta personas con comercios y servicios
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

    <h3>Términos y Condiciones de Uso – Calcha</h3>
    <p><strong>Última actualización:</strong> ___ / ___ / 2026</p>

    <h4>1. ¿Qué es Calcha?</h4>
    <p>
      Calcha es una plataforma digital de difusión y contacto que conecta
      a usuarios con comercios, prestadores de servicios y repartidores
      independientes dentro de una misma zona geográfica.
    </p>

    <p>
      Calcha no vende productos, no gestiona pagos, no cobra comisiones
      ni interviene en transacciones, acuerdos, reservas, envíos
      o comunicaciones entre las partes.
    </p>

    <h4>2. Rol de Calcha (Limitación de Responsabilidad)</h4>
    <p>
      Calcha actúa únicamente como un medio de exhibición de información
      proporcionada por terceros.
    </p>

    <ul>
      <li>No es responsable por la calidad, precio o legalidad de los productos o servicios.</li>
      <li>No garantiza disponibilidad ni cumplimiento de lo publicado.</li>
      <li>No se responsabiliza por conflictos entre usuarios y comercios.</li>
    </ul>

    <p>
      Toda operación se realiza bajo exclusiva responsabilidad
      de usuarios y comercios.
    </p>

    <h4>3. Comercios y Moto Delivery</h4>
    <p>
      Los comercios y repartidores visibles en Calcha son independientes
      y no mantienen relación laboral ni comercial con la plataforma.
    </p>

    <p>
      Los repartidores coordinan directamente con los usuarios.
      Calcha no verifica antecedentes, habilitaciones ni seguros.
    </p>

    <h4>4. Ubicación y Visibilidad</h4>
    <p>
      Calcha puede mostrar perfiles según rubro o ubicación,
      sin garantizar cobertura total ni prioridad.
    </p>

    <h4>5. Uso Adecuado</h4>
    <p>
      El usuario se compromete a utilizar Calcha de buena fe
      y no para actividades ilícitas o engañosas.
    </p>

    <h4>6. Propiedad del Contenido</h4>
    <p>
      Los contenidos publicados son responsabilidad de quien los carga.
    </p>

    <h4>7. Modificaciones</h4>
    <p>
      Calcha puede modificar estos términos en cualquier momento.
    </p>

    <h4>8. Legislación Aplicable</h4>
    <p>
      Estos términos se rigen por las leyes de la República Argentina.
    </p>

    <h4>9. Contacto</h4>
    <p>
      Para consultas: <strong>contacto@calcha.app</strong>
    </p>

    <p>
      Al utilizar Calcha, el usuario declara haber leído
      y aceptado estos Términos y Condiciones.
    </p>

  </div>
`;
  const btnTerminos = document.getElementById("btn-terminos");
const terminos = document.getElementById("terminos-container");

btnTerminos.addEventListener("click", () => {
  terminos.classList.toggle("oculto");

  btnTerminos.innerText = terminos.classList.contains("oculto")
    ? "📄 Términos y Condiciones"
    : "❌ Ocultar Términos y Condiciones";
});
  document.querySelector(".btn-volver").onclick = () => history.back();
}

// =========================
// RESERVA / INFO COMERCIO
// =========================
function renderInfoComercio() {
  if (!comercioActivo) return volverHome();

  app.innerHTML = `
    <button class="btn-volver">←</button>
    <img src="${comercioActivo.imagen}" class="comercio-portada">
    <h2>${comercioActivo.nombre}</h2>
    <p>${comercioActivo.descripcion}</p>

    ${renderLinksComercio(comercioActivo)}
  `;

  // Insertar galerías
  if (comercioActivo.galerias) {
    Object.entries(comercioActivo.galerias).forEach(([categoria, fotos]) => {
      const galeriaHTML = `
        <h3>${categoria}</h3>
        <div class="galeria-comercio">
          ${fotos.map(img =>
            `<img src="${img}" class="galeria-img" data-fotos='${JSON.stringify(fotos)}'>`
          ).join("")}
        </div>
      `;
      app.insertAdjacentHTML("beforeend", galeriaHTML);
    });

    // 🔹 Activamos la galería solo una vez aquí
    activarGaleria();
  }

  document.querySelector(".btn-volver").onclick = () => history.back();
}

function renderReserva() {
  if (!comercioActivo) return volverHome();

  const urlReserva =
    comercioActivo.urlReserva ||
    `https://wa.me/54${comercioActivo.whatsapp}?text=${encodeURIComponent(
      "Hola, quiero reservar"
    )}`;

  app.innerHTML = `
    <button class="btn-volver">←</button>
    <img src="${comercioActivo.imagen}" class="comercio-portada">
    <h2>${comercioActivo.nombre}</h2>
    <p>${comercioActivo.descripcion}</p>

    ${renderLinksComercio(comercioActivo)}

    ${comercioActivo.galerias
      ? Object.entries(comercioActivo.galerias).map(([categoria, fotos]) => `
          <h3>${categoria}</h3>
          <div class="galeria-comercio">
            ${fotos.map(img =>
              `<img src="${img}" class="galeria-img" data-fotos='${JSON.stringify(fotos)}'>`
            ).join("")}
          </div>
        `).join("")
      : ""
    }

    <button onclick="window.open('${urlReserva}','_blank')">📅 Reservar</button>
  `;

  document.querySelectorAll(".galeria-img").forEach(img => {
    img.onclick = () =>
      abrirLightbox(img.src, JSON.parse(img.dataset.fotos));
  });

  document.querySelector(".btn-volver").onclick = () => history.back();
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
      menuHTML += `<div class="menu-categoria">${categoriaActual}</div>`;
    }

    const enCarrito = carrito.find(p => p.nombre === item.nombre);

    menuHTML += `
      <div class="item-menu">
        <span>${item.nombre} - $${item.precio}</span>
        <div>
          ${enCarrito ? `
            <button data-i="${i}" data-a="restar">−</button>
            <strong>${enCarrito.cantidad}</strong>
          ` : ""}
          <button data-i="${i}" data-a="sumar">+</button>
        </div>
      </div>
    `;
  });

  const total = carrito.reduce(
    (s, p) => s + p.precio * p.cantidad,
    0
  );

  app.innerHTML = `
    <button class="btn-volver">←</button>
    <img src="${comercioActivo.imagen}" class="comercio-portada">
    <h2>${comercioActivo.nombre}</h2>
    <p>${comercioActivo.descripcion}</p>

    ${renderLinksComercio(comercioActivo)}

    ${comercioActivo.galerias
      ? Object.entries(comercioActivo.galerias).map(([categoria, fotos]) => `
          <h3>${categoria}</h3>
          <div class="galeria-comercio">
            ${fotos.map(img =>
              `<img src="${img}" class="galeria-img" data-fotos='${JSON.stringify(fotos)}'>`
            ).join("")}
          </div>
        `).join("")
      : ""
    }

    <div class="menu">${menuHTML}</div>

    <h3>Entrega</h3>
    <div class="entrega">
      <button id="retiro" class="${tipoEntrega === "retiro" ? "activo" : ""}">
        🏠 Retiro
      </button>
      ${comercioActivo.permiteDelivery ? `
        <button id="delivery" class="${tipoEntrega === "delivery" ? "activo" : ""}">
          🛵 Delivery
        </button>
      ` : ""}
    </div>

    ${tipoEntrega === "delivery"
      ? `<input id="direccion" placeholder="Dirección" value="${direccionEntrega}">`
      : ""
    }

    <div class="carrito">
      <strong>Total: $${total}</strong>
      <button class="btn-continuar"
        ${!total || !tipoEntrega ? "disabled" : ""}
        id="continuar">
        Continuar
      </button>
    </div>
  `;

  document.querySelectorAll(".galeria-img").forEach(img => {
    img.onclick = () =>
      abrirLightbox(img.src, JSON.parse(img.dataset.fotos));
  });

  document.querySelector(".btn-volver").onclick = () => history.back();

  document.querySelectorAll("[data-a]").forEach(b => {
    b.onclick = () => {
      const prod = comercioActivo.menu[b.dataset.i];
      const ex = carrito.find(p => p.nombre === prod.nombre);

      if (b.dataset.a === "sumar") {
        ex ? ex.cantidad++ : carrito.push({ ...prod, cantidad: 1 });
      }

      if (b.dataset.a === "restar" && ex) {
        ex.cantidad--;
        if (ex.cantidad === 0)
          carrito = carrito.filter(p => p !== ex);
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
  if (dir) dir.oninput = e => (direccionEntrega = e.target.value);

  document.getElementById("continuar").onclick = () => {
    vistaActual = "confirmar";
    history.pushState({ vista: "confirmar" }, "", "#confirmar");
    renderConfirmar();
  };
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
function renderLinksComercio(comercio) {
  if (!comercio.links) return "";

  let html = `<div class="comercio-links">`;

  if (comercio.links.maps) {
    html += `
      <a href="${comercio.links.maps}" target="_blank" class="icon-link">
        <img src="images/mapslogo.png" alt="Cómo llegar">
      </a>`;
  }

  if (comercio.links.instagram) {
    html += `
      <a href="${comercio.links.instagram}" target="_blank" class="icon-link">
        <img src="images/instagramlogo.png" alt="Instagram">
      </a>`;
  }

  if (comercio.links.facebook) {
    html += `
      <a href="${comercio.links.facebook}" target="_blank" class="icon-link">
        <img src="images/facebooklogo.png" alt="Facebook">
      </a>`;
  }

  if (comercio.links.whatsapp) {
    html += `
      <a href="${comercio.links.whatsapp}" target="_blank" class="icon-link">
        <img src="images/whatsapplogo.png" alt="WhatsApp">
      </a>`;
  }

  html += `</div>`;
  return html;
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

    comercios
      .filter(c => !ubicacionActiva || c.ubicacion === ubicacionActiva) // filtra por ubicación
      .filter(c => {
        return (
          c.nombre.toLowerCase().includes(t) ||
          c.rubro.toLowerCase().includes(t) ||
          (c.descripcion && c.descripcion.toLowerCase().includes(t))
        );
      })
      .forEach(c => {
        const card = document.createElement("div");
        card.classList.add("card-resultado");

        // Resaltado solo en el nombre
        const regex = new RegExp(`(${t})`, "gi");
        const nombreResaltado = c.nombre.replace(regex, `<mark>$1</mark>`);

        card.innerHTML = `
          <div class="card-img">
            <img src="${c.imagen || 'images/default.jpg'}" alt="${c.nombre}">
          </div>
          <div class="card-info">
            <strong class="busqueda-nombre">${nombreResaltado}</strong>
            <small class="busqueda-rubro">${c.rubro}</small>
            <small class="busqueda-zona">Zona: ${c.ubicacion || 'No especificada'}</small>
          </div>
        `;

        card.onclick = () => {
          comercioActivo = c;
          vistaActual = "pedido";
          history.pushState({ vista: "pedido", comercioId: c.id }, "", "#pedido");
          renderPedido();
        };

        resultados.appendChild(card);
      });
  };
}
// =========================
// LIGHTBOX
// =========================
let lightboxDiv = null;
let lightboxFotos = [];
let lightboxIndex = 0;

function abrirLightbox(src, fotos = []) {
  const lightboxAbierto = lightboxDiv && lightboxDiv.style.display === "flex";

  lightboxFotos = fotos.length ? fotos : [src];
  lightboxIndex = lightboxFotos.indexOf(src);
  if (lightboxIndex === -1) lightboxIndex = 0;

  if (!lightboxDiv) {
    lightboxDiv = document.createElement("div");
    lightboxDiv.className = "lightbox";
    lightboxDiv.innerHTML = `
      <span class="lightbox-close">✖</span>
      <span class="lightbox-prev">◀</span>
      <img class="lightbox-img">
      <span class="lightbox-next">▶</span>
    `;
    document.body.appendChild(lightboxDiv);

    lightboxDiv.querySelector(".lightbox-close").onclick = cerrarLightbox;
    lightboxDiv.onclick = e => { if (e.target === lightboxDiv) cerrarLightbox(); };
    lightboxDiv.querySelector(".lightbox-img").onclick = e => e.stopPropagation();
    lightboxDiv.querySelector(".lightbox-prev").onclick = e => { e.stopPropagation(); moverLightbox(-1); };
    lightboxDiv.querySelector(".lightbox-next").onclick = e => { e.stopPropagation(); moverLightbox(1); };
  }

  actualizarLightbox();
  lightboxDiv.style.display = "flex";

  // 🔹 Solo pushState si no estaba abierto
  if (!lightboxAbierto) {
    history.pushState({
      vista: vistaActual,
      rubro: rubroActivo,
      ubicacion: ubicacionActiva,
      comercioId: comercioActivo?.id ?? null,
      lightbox: true
    }, "", "");
  }
}


function moverLightbox(dir) {
  lightboxIndex += dir;
  if (lightboxIndex < 0) lightboxIndex = lightboxFotos.length - 1;
  if (lightboxIndex >= lightboxFotos.length) lightboxIndex = 0;
  actualizarLightbox();
}

function actualizarLightbox() {
  lightboxDiv.querySelector(".lightbox-img").src = lightboxFotos[lightboxIndex];
}

function cerrarLightbox() {
  if (lightboxDiv) {
    lightboxDiv.style.display = "none";

    // 🔹 Volver al estado anterior en el historial si estaba abierto
    if (history.state?.lightbox) {
      history.back();
    }
  }
}

// =========================
// ACTIVAR GALERÍA
// =========================
function cerrarLightbox(volverHistorial = true) {
  if (!lightboxDiv) return;

  lightboxDiv.style.display = "none";

  // 🔹 SOLO volver en el historial si el cierre fue manual
  if (volverHistorial && history.state?.lightbox) {
    history.back();
  }
}

// =========================
// UTIL
// =========================

function sumarMiComercio() {
  const msg = encodeURIComponent(`¡Hola! 👋
Quiero sumar mi comercio o servicio a Calcha 🏔️

Nombre / Rubro / Ubicación:
WhatsApp:

Gracias, espero su respuesta. 😊`);

  window.open(`https://wa.me/${WHATSAPP_ADMIN}?text=${msg}`, "_blank");
}
