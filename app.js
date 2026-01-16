// =========================
// CALCHA - MOTOR COMPLETO (RESTAURADO)
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");
const WHATSAPP_ADMIN = "5493875181644";
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
  // HISTORIAL
  // ------------------------
  window.addEventListener("popstate", (e) => {
    vistaActual = e.state?.vista || "home";
    if (e.state?.comercioId) {
      comercioActivo = comercios.find(c => c.id === e.state.comercioId);
    }
    renderApp();
  });

  // ------------------------
  // DATA
  // ------------------------
  fetch("comercios.json")
    .then(r => r.json())
    .then(data => {
      comercios = data;
      renderHome();
    });

  function renderApp() {
    if (vistaActual === "home") renderHome();
    if (vistaActual === "pedido") renderPedido();
    if (vistaActual === "confirmar") renderConfirmar();
    if (vistaActual === "info") renderInfo();
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
  menuRubrosAbierto
    ? `<div class="menu-rubros">
  <button data-rubro="todos">Todos</button>
  <button data-rubro="gastronomía">🍔 Gastronomía</button>
  <button data-rubro="artesanía">🏺 Artesanía</button>
  <button data-rubro="hotel">🏨 Hotelería</button>
  <button data-rubro="servicios">🛠️ Servicios</button>
</div>

<div class="acciones">
  <button id="btn-info" class="btn-menu">
    ℹ️ ¿Qué es Calcha?
  </button>

  <button id="btn-sumar-comercio" class="btn-menu">
    ➕ Sumar mi comercio
  </button>
</div>`
    : ""
}

      <div id="lista-comercios"></div>
    `;
const btnSumar = document.getElementById("btn-sumar-comercio");
if (btnSumar) {
  btnSumar.onclick = sumarMiComercio;
}
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
        renderHome();
      };
    });

    const lista = document.getElementById("lista-comercios");
    const filtrados = rubroActivo === "todos"
      ? comercios
      : comercios.filter(c => c.rubro === rubroActivo);

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
        vistaActual = "pedido";
        history.pushState({ vista: "pedido", comercioId: c.id }, "", "#pedido");
        renderPedido();
      };
      lista.appendChild(card);
    });
  }

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
        </div>`;
    });

    const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);

    app.innerHTML = `
  <button class="btn-volver">← Volver</button>

  <img src="${comercioActivo.imagen}" class="comercio-img">

  <h2>${comercioActivo.nombre}</h2>
  <p>${comercioActivo.descripcion}</p>

  ${
    comercioActivo.galeria && comercioActivo.galeria.length > 0
      ? `
        <div class="galeria-comercio">
          ${comercioActivo.galeria
            .map(
              img =>
                `<img src="${img}" class="galeria-img" alt="Galería ${comercioActivo.nombre}">`
            )
            .join("")}
        </div>
      `
      : ""
  }

  <div class="menu">${menuHTML}</div>

      <h3>Entrega</h3>
      <div class="entrega">
        <button id="retiro" class="${tipoEntrega === "retiro" ? "activo" : ""}">🏠 Retiro</button>
        ${comercioActivo.permiteDelivery
          ? `<button id="delivery" class="${tipoEntrega === "delivery" ? "activo" : ""}">🛵 Delivery</button>`
          : ""}
      </div>

      ${tipoEntrega === "delivery"
        ? `<input id="direccion" placeholder="Dirección" value="${direccionEntrega}">`
        : ""}

      <div class="carrito">
        <strong>Total: $${total}</strong>
        <button class="btn-continuar" ${!total || !tipoEntrega ? "disabled" : ""} id="continuar">
          Continuar
        </button>
      </div>
    `;

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
});
