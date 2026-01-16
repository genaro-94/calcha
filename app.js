// =========================
// CALCHA - MOTOR BASE
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  // Estados globales
  let vistaActual = "home";
  let comercioActivo = null;
  let carrito = [];
  let tipoEntrega = null;
  let direccionEntrega = "";
  let rubroActivo = "todos";
  let menuRubrosAbierto = false;

  // ------------------------
  // CARGAR COMERCIOS DESDE JSON
  // ------------------------
  let comercios = [];
  fetch("comercios.json")
    .then(res => res.json())
    .then(data => {
      comercios = data;
      renderApp();
    })
    .catch(err => console.error("Error cargando comercios:", err));

  // ------------------------
  // RENDER GENERAL
  // ------------------------
  function renderApp() {
    if (vistaActual === "home") renderHome();
    if (vistaActual === "operacion") renderOperacion();
    if (vistaActual === "info") renderInfo();
  }

  // ------------------------
  // HOME
  // ------------------------
  function renderHome() {
    app.innerHTML = `
      <h1>
        <img src="images/Logo.png" alt="Logo Calcha" style="width:32px; height:32px; vertical-align:middle; margin-right:8px;">
        CALCHA
      </h1>
      <p>El mercado local en tu mano</p>
      <button id="btn-rubros">☰</button>
      ${
        menuRubrosAbierto ? 
        `<div class="menu-rubros">
          <button data-rubro="todos">Todos</button>
          <button data-rubro="gastronomía">🍔 Gastronomía</button>
          <button data-rubro="artesanía">🏺 Artesanía</button>
          <button data-rubro="hotel">🏨 Hotelería</button>
          <button data-rubro="servicios">🛠️ Servicios</button>
          <hr>
          <button id="btn-comercio">➕ Sumá tu comercio</button>
          <button id="btn-info">ℹ️ ¿Qué es Calcha?</button>
        </div>` : ''
      }
      <div id="lista-comercios"></div>
    `;

    document.getElementById("btn-rubros").onclick = () => {
      menuRubrosAbierto = !menuRubrosAbierto;
      renderHome();
    };

    const btnComercio = document.getElementById("btn-comercio");
    if (btnComercio) {
      btnComercio.onclick = () => {
        const mensaje = encodeURIComponent(
          "Hola, tengo un comercio y quiero sumarme a Calcha."
        );
        window.open("https://wa.me/543875181644?text=" + mensaje, "_blank");
      };
    }

    const btnInfo = document.getElementById("btn-info");
    if (btnInfo) {
      btnInfo.onclick = () => {
        menuRubrosAbierto = false;
        vistaActual = "info";
        history.pushState({ vista: "info" }, "", "#info");
        renderApp();
      };
    }

    document.querySelectorAll(".menu-rubros button[data-rubro]").forEach(btn => {
      btn.onclick = () => {
        rubroActivo = btn.dataset.rubro;
        menuRubrosAbierto = false;
        renderHome();
      };
    });

    const contenedor = document.getElementById("lista-comercios");
    const comerciosFiltrados =
      rubroActivo === "todos"
        ? comercios
        : comercios.filter(c => c.rubro.toLowerCase() === rubroActivo.toLowerCase());

    comerciosFiltrados.forEach(comercio => {
      const card = document.createElement("div");
      card.className = "card-comercio";
      card.innerHTML = `
        <img src="${comercio.imagen || 'images/default-comercio.jpg'}" class="comercio-img">
        <h3>${comercio.nombre}</h3>
        <p>${comercio.descripcion}</p>
        <button>Ver</button>
      `;
      card.querySelector("button").onclick = () => {
        comercioActivo = comercio;
        if (!comercioActivo.menu) comercioActivo.menu = [];
        if (!comercioActivo.galeria) comercioActivo.galeria = [];
        resetEstados();
        vistaActual = "operacion";
        history.pushState({ vista: "operacion" }, "", "#operacion");
        renderApp();
      };
      contenedor.appendChild(card);
    });
  }

  // ------------------------
  // RENDER OPERACIÓN SEGÚN TIPO
  // ------------------------
  function renderOperacion() {
    switch (comercioActivo.tipoOperacion) {
      case "pedido":
        renderPedido();
        break;
      case "catalogo":
        renderCatalogo();
        break;
      case "reserva":
        renderReserva();
        break;
      case "contacto":
        renderContacto();
        break;
      default:
        renderHome();
    }
  }

  // ------------------------
  // PEDIDO
  // ------------------------
  function renderPedido() {
    let menuHTML = "";
    comercioActivo.menu.forEach((item, i) => {
      const enCarrito = carrito.find(p => p.nombre === item.nombre);
      menuHTML += `
        <div class="item-menu">
          <span>${item.nombre} - $${item.precio}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            ${enCarrito ? `<button data-i="${i}" data-accion="restar">−</button><strong>${enCarrito.cantidad}</strong>` : ""}
            <button data-i="${i}" data-accion="sumar">+</button>
          </div>
        </div>`;
    });

    let galeriaHTML = '';
    if (comercioActivo.galeria && comercioActivo.galeria.length) {
      galeriaHTML = '<div class="galeria-comercio">';
      comercioActivo.galeria.forEach(img => {
        galeriaHTML += `<img src="${img}" alt="${comercioActivo.nombre}" class="galeria-img">`;
      });
      galeriaHTML += '</div>';
    }

    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>${comercioActivo.nombre}</h2>
      ${galeriaHTML}
      <div class="entrega">
        <button class="${tipoEntrega === "retiro" ? "activo" : ""}" id="retiro">🏪 Retiro</button>
        ${comercioActivo.permiteDelivery ? `<button class="${tipoEntrega === "delivery" ? "activo" : ""}" id="delivery">🛵 Delivery</button>` : ""}
      </div>
      <div class="menu">${menuHTML}</div>
      <div class="carrito">
        <strong>Total: $${total}</strong>
        <button class="btn-continuar" id="continuar" ${!total || !tipoEntrega ? "disabled" : ""}>Continuar</button>
      </div>
    `;

    document.querySelector(".btn-volver").onclick = volverHome;

    document.querySelectorAll(".item-menu button").forEach(b => {
      b.onclick = () => {
        const producto = comercioActivo.menu[b.dataset.i];
        const existente = carrito.find(p => p.nombre === producto.nombre);
        if (b.dataset.accion === "sumar") {
          if (existente) existente.cantidad++;
          else carrito.push({ ...producto, cantidad: 1 });
        }
        if (b.dataset.accion === "restar" && existente) {
          existente.cantidad--;
          if (existente.cantidad === 0) carrito = carrito.filter(p => p.nombre !== producto.nombre);
        }
        renderPedido();
      };
    });

    document.getElementById("retiro").onclick = () => { tipoEntrega = "retiro"; renderPedido(); };
    if (comercioActivo.permiteDelivery)
      document.getElementById("delivery").onclick = () => { tipoEntrega = "delivery"; renderPedido(); };

    document.getElementById("continuar").onclick = renderConfirmacionPedido;
  }

  // ------------------------
  // INFO
  // ------------------------
  function renderInfo() {
    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>🌵 ¿Qué es Calcha?</h2>
      <p>Calcha es una plataforma que conecta a los comercios y servicios locales con las personas de la zona.</p>
      <p><strong>Calcha apoya lo local.</strong></p>
    `;
    document.querySelector(".btn-volver").onclick = volverHome;
  }

  // ------------------------
  // BOTÓN FÍSICO ANDROID
  // ------------------------
  window.addEventListener("popstate", () => {
    if (vistaActual !== "home") {
      volverHome();
    }
  });

  // ------------------------
  // HELPERS
  // ------------------------
  function volverHome() {
    resetEstados();
    vistaActual = "home";
    renderApp();
  }

  function resetEstados() {
    carrito = [];
    tipoEntrega = null;
    direccionEntrega = "";
  }
});
