// =========================
// CALCHA - MOTOR COMPLETO
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  let vistaActual = "home";
  let comercioActivo = null;
  let carrito = [];
  let tipoEntrega = null;
  let direccionEntrega = "";
  let rubroActivo = "todos";
  let menuRubrosAbierto = false;
  let comercios = [];

  // ------------------------
  // HISTORIAL (BOTÓN FÍSICO)
  // ------------------------
  window.addEventListener("popstate", (e) => {
    if (!e.state) {
      vistaActual = "home";
    } else {
      vistaActual = e.state.vista;
      if (e.state.comercioId) {
        comercioActivo = comercios.find(c => c.id === e.state.comercioId);
      }
    }
    renderApp();
  });

  // ------------------------
  // DATA
  // ------------------------
  fetch("comercios.json")
    .then(res => res.json())
    .then(data => {
      comercios = data;
      renderHome();
    });

  // ------------------------
  // RENDER GENERAL
  // ------------------------
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
      <p>El mercado local en tu mano</p>

      <button id="btn-rubros">☰</button>

      ${menuRubrosAbierto ? `
        <div class="menu-rubros">
          <button data-rubro="todos">Todos</button>
          <button data-rubro="gastronomía">🍔 Gastronomía</button>
          <button data-rubro="artesanía">🏺 Artesanía</button>
          <button data-rubro="hotel">🏨 Hotelería</button>
          <button data-rubro="servicios">🛠️ Servicios</button>
          <hr>
          <button id="btn-info">ℹ️ ¿Qué es Calcha?</button>
        </div>` : ""}
      <div id="lista-comercios"></div>
    `;

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
        <img src="${c.imagen}" style="width:100%;object-fit:cover;">
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
        history.pushState(
          { vista: "pedido", comercioId: c.id },
          "",
          "#pedido"
        );
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
        </div>
      `;
    });

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>${comercioActivo.nombre}</h2>

      <div class="menu">${menuHTML}</div>

      <h3>Entrega</h3>
      <button id="retiro">🏠 Retiro</button>
      <button id="delivery">🛵 Delivery</button>

      ${tipoEntrega === "delivery" ? `
        <input id="direccion" placeholder="Dirección de entrega" value="${direccionEntrega}">
      ` : ""}

      <button id="continuar">Continuar</button>
    `;

    document.querySelector(".btn-volver").onclick = () => history.back();

    document.querySelectorAll("[data-a]").forEach(b => {
      b.onclick = () => {
        const prod = comercioActivo.menu[b.dataset.i];
        const ex = carrito.find(p => p.nombre === prod.nombre);
        if (b.dataset.a === "sumar") {
          if (ex) ex.cantidad++;
          else carrito.push({ ...prod, cantidad: 1 });
        } else if (b.dataset.a === "restar" && ex) {
          ex.cantidad--;
          if (ex.cantidad <= 0) carrito = carrito.filter(p => p !== ex);
        }
        renderPedido();
      };
    });

    document.getElementById("retiro").onclick = () => {
      tipoEntrega = "retiro";
      direccionEntrega = "";
      renderPedido();
    };

    document.getElementById("delivery").onclick = () => {
      tipoEntrega = "delivery";
      renderPedido();
    };

    const dir = document.getElementById("direccion");
    if (dir) {
      dir.oninput = e => direccionEntrega = e.target.value;
    }

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
    let total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0);
    let texto = carrito.map(p => `${p.cantidad}x ${p.nombre}`).join("%0A");

    let msg = `Pedido en ${comercioActivo.nombre}%0A${texto}%0ATotal: $${total}%0AEntrega: ${tipoEntrega}`;
    if (tipoEntrega === "delivery") msg += `%0ADirección: ${direccionEntrega}`;

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>Confirmar pedido</h2>
      <p>Total: $${total}</p>
      <a target="_blank"
         href="https://wa.me/54${comercioActivo.whatsapp}?text=${msg}">
         Enviar por WhatsApp
      </a>
    `;

    document.querySelector(".btn-volver").onclick = () => history.back();
  }

  // ------------------------
  // INFO
  // ------------------------
  function renderInfo() {
    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>¿Qué es Calcha?</h2>
      <p>Plataforma de comercios locales.</p>
    `;
    document.querySelector(".btn-volver").onclick = () => history.back();
  }
});
