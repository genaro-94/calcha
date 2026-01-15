// =========================
// CALCHA - MOTOR BASE
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  let vistaActual = "home";
  let comercioActivo = null;

  // estados generales
  let carrito = [];
  let tipoEntrega = null;
  let direccionEntrega = "";

  // filtro
  let rubroActivo = "todos";
  let menuRubrosAbierto = false;

  // ------------------------
  // MODELO DE COMERCIOS
  // ------------------------
  let comercios = [];

fetch("comercios.json")
  .then(res => res.json())
  .then(data => {
    comercios = data;
  .catch(err => console.error("Error cargando comercios:", err));
  function renderComercios(comercios) {
  const container = document.getElementById("app"); // contenedor donde se renderizan
  container.innerHTML = ""; // limpia antes de dibujar

  comercios.forEach(c => {
    container.innerHTML += `
      <div class="comercio-card">
        <img src="${c.imagen || 'images/default-comercio.jpg'}" class="comercio-img">
        <h3>${c.nombre}</h3>
        <p>${c.rubro}</p>
      </div>
    `;
  });
}
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
      <h2>🌵CALCHA</h2>
      <p>El mercado local en tu mano</p>

      <button id="btn-rubros">☰</button>

      ${
        menuRubrosAbierto
          ? `

</div>
<div class="menu-rubros">
  <button data-rubro="todos">Todos</button>
  <button data-rubro="gastronomia">🍔 Gastronomía</button>
  <button data-rubro="artesania">🏺 Artesanía</button>
  <button data-rubro="hotel">🏨 Hotelería</button>
  <button data-rubro="servicios">🛠️ Servicios</button>

  <hr>

  <button id="btn-comercio">➕ Sumá tu comercio</button>
  
  <button id="btn-info">ℹ️ ¿Qué es Calcha?</button>
</div>
        `
          : ""
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
    window.open(
      "https://wa.me/543875181644?text=" + mensaje,
      "_blank"
    );
  };
}
    const btnInfo = document.getElementById("btn-info");
if (btnInfo) {
  btnInfo.onclick = () => {
    menuRubrosAbierto = false;
    vistaActual = "info";
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
        : comercios.filter(c => c.rubro === rubroActivo);

    comerciosFiltrados.forEach((comercio) => {
      const card = document.createElement("div");
      card.className = "card-comercio";
      card.innerHTML = `
        <h3>${comercio.nombre}</h3>
        <p>${comercio.descripcion}</p>
        <button>Ver</button>
      `;

      card.querySelector("button").onclick = () => {
        comercioActivo = comercio;
        resetEstados();
        vistaActual = "operacion";
        renderApp();
      };

      contenedor.appendChild(card);
    });
  }

  // ------------------------
  // MOTOR POR OPERACIÓN
  // ------------------------
  function renderOperacion() {
    switch (comercioActivo.tipoOperacion) {
      case "pedido": renderPedido(); break;
      case "catalogo": renderCatalogo(); break;
      case "reserva": renderReserva(); break;
      case "contacto": renderContacto(); break;
    }
  }

  // ------------------------
  // PEDIDOS
  // ------------------------
  function renderPedido() {
    let menuHTML = "";
    comercioActivo.menu.forEach((item, i) => {
      const enCarrito = carrito.find(p => p.nombre === item.nombre);

menuHTML += `

  <div class="item-menu">

    <span>${item.nombre}</span>

    <div style="display:flex; align-items:center; gap:6px;">

      ${

        enCarrito

          ? `<button data-i="${i}" data-accion="restar">−</button>

             <strong>${enCarrito.cantidad}</strong>`

          : ""

      }

      <button data-i="${i}" data-accion="sumar">+</button>

    </div>

  </div>

`;
    });

    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>${comercioActivo.nombre}</h2>

      <div class="entrega">
        <button class="${tipoEntrega === "retiro" ? "activo" : ""}" id="retiro">🏪 Retiro</button>
        ${
          comercioActivo.permiteDelivery
            ? `<button class="${tipoEntrega === "delivery" ? "activo" : ""}" id="delivery">🛵 Delivery</button>`
            : ""
        }
      </div>

      <div class="menu">${menuHTML}</div>

      <div class="carrito">
        <strong>Total: $${total}</strong>
        <button class="btn-continuar" id="continuar" ${!total || !tipoEntrega ? "disabled" : ""}>
          Continuar
        </button>
      </div>
    `;

    document.querySelector(".btn-volver").onclick = volverHome;

    document.querySelectorAll(".item-menu button").forEach((b) => {

  b.onclick = () => {

    const producto = comercioActivo.menu[b.dataset.i];

    const existente = carrito.find(p => p.nombre === producto.nombre);

    if (b.dataset.accion === "sumar") {

      if (existente) {

        existente.cantidad++;

      } else {

        carrito.push({ ...producto, cantidad: 1 });

      }

    }

    if (b.dataset.accion === "restar" && existente) {

      existente.cantidad--;

      if (existente.cantidad === 0) {

        carrito = carrito.filter(p => p.nombre !== producto.nombre);

      }

    }

    renderPedido();

  };

});

    document.getElementById("retiro").onclick = () => {
      tipoEntrega = "retiro";
      renderPedido();
    };

    if (comercioActivo.permiteDelivery) {
      document.getElementById("delivery").onclick = () => {
        tipoEntrega = "delivery";
        renderPedido();
      };
    }

    document.getElementById("continuar").onclick = renderConfirmacionPedido;
  }

  // ------------------------
  // CONFIRMACIÓN PEDIDO
  // ------------------------
  function renderConfirmacionPedido() {
    const total = carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);

    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>Confirmar pedido</h2>

      ${carrito.map(i =>
        `<p>${i.nombre} x${i.cantidad} - $${i.precio * i.cantidad}</p>`
      ).join("")}

      <p><strong>Entrega:</strong> ${tipoEntrega}</p>

      ${
        tipoEntrega === "delivery"
          ? `<input id="direccion" placeholder="Dirección" value="${direccionEntrega}">`
          : ""
      }

      <h3>Total: $${total}</h3>
      <button class="btn-confirmar" id="enviar">Enviar por WhatsApp</button>
    `;

    document.querySelector(".btn-volver").onclick = renderPedido;

    if (tipoEntrega === "delivery") {
      document.getElementById("direccion").oninput = e => {
        direccionEntrega = e.target.value;
      };
    }

    document.getElementById("enviar").onclick = () => {
      let msg = `🛒 Pedido - ${comercioActivo.nombre}\n\n`;
      carrito.forEach(i => {
        msg += `• ${i.nombre} x${i.cantidad} $${i.precio * i.cantidad}\n`;
      });
      msg += `\nTotal: $${total}\nEntrega: ${tipoEntrega}`;
      if (tipoEntrega === "delivery") msg += `\nDirección: ${direccionEntrega}`;

      window.open(
        `https://wa.me/${comercioActivo.whatsapp}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );

      volverHome();
    };
  }

  // ------------------------
  // CATÁLOGO / RESERVA / CONTACTO
  // ------------------------
  function renderCatalogo() {
    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>${comercioActivo.nombre}</h2>
      ${comercioActivo.catalogo.map(p => `<p>${p.nombre} - $${p.precio}</p>`).join("")}
      <button class="btn-confirmar" id="consultar">Consultar por WhatsApp</button>
    `;
    document.querySelector(".btn-volver").onclick = volverHome;
    document.getElementById("consultar").onclick = () => {
      window.open(`https://wa.me/${comercioActivo.whatsapp}`, "_blank");
    };
  }

  function renderReserva() {
    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>${comercioActivo.nombre}</h2>
      <button class="btn-confirmar" id="reservar">Consultar reserva</button>
    `;
    document.querySelector(".btn-volver").onclick = volverHome;
    document.getElementById("reservar").onclick = () => {
      window.open(`https://wa.me/${comercioActivo.whatsapp}`, "_blank");
    };
  }

  function renderContacto() {
    app.innerHTML = `
      <button class="btn-volver">← Volver</button>
      <h2>${comercioActivo.nombre}</h2>
      <button class="btn-confirmar" id="contactar">Contactar</button>
    `;
    document.querySelector(".btn-volver").onclick = volverHome;
    document.getElementById("contactar").onclick = () => {
      window.open(`https://wa.me/${comercioActivo.whatsapp}`, "_blank");
    };
  }
function renderInfo() {

  app.innerHTML = `

    <button class="btn-volver">← Volver</button>

    <h2>🌵 ¿Qué es Calcha?</h2>

    <p>

      Calcha es una plataforma que conecta a los comercios y servicios

      locales con las personas de la zona.

    </p>

    <p>

      Pedí comida, encontrá artesanos, hoteles o servicios

      sin intermediarios ni comisiones ocultas.

    </p>

    <p>

      Todo se gestiona directamente por WhatsApp,

      de forma simple y rápida.

    </p>

    <p><strong>Calcha apoya lo local.</strong></p>

  `;

  document.querySelector(".btn-volver").onclick = () => {

    vistaActual = "home";

    renderApp();

  };

}
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
 
  renderApp();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log("✅ Service Worker registrado"))
      .catch((err) => console.error("❌ SW error:", err));
  });
}
