// 🛒 Inicializar carrito desde localStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// 🧾 Actualizar resumen en el offcanvas y contador
function actualizarResumen() {
  const resumen = document.getElementById("resumen-pedido");
  const contador = document.getElementById("contador-carrito");

  if (resumen) resumen.innerHTML = "";

  carrito.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between align-items-center mb-2";
    div.innerHTML = `
      <span>${item.nombre} - $${item.precio}</span>
      <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem(${index})">Eliminar</button>
    `;
    resumen?.appendChild(div);
  });

  const total = carrito.reduce((acc, item) => acc + item.precio, 0);
  const totalElement = document.getElementById("total");
  if (totalElement) totalElement.textContent = `Total: $${total}`;

  if (contador) contador.textContent = carrito.length;
}

// 🗑️ Eliminar producto del carrito
function eliminarItem(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  actualizarResumen();
  renderizarProductos(); // por si estás en orden.html
}

// 💾 Guardar carrito en localStorage
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// 📦 Renderizar productos en orden.html
function renderizarProductos() {
  const lista = document.getElementById("lista-productos");
  if (!lista) return;

  lista.innerHTML = "";
  let total = 0;

  carrito.forEach(p => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `${p.nombre} <span>$${p.precio}</span>`;
    lista.appendChild(li);
    total += p.precio;
  });

  const envioCheckbox = document.getElementById("envioCheckbox");
  if (envioCheckbox && envioCheckbox.checked) {
    total *= 1.1;
  }

  const totalElement = document.getElementById("total");
  if (totalElement) {
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
  }
}

// ✅ Confirmar orden en orden.html con validación y confirmación SweetAlert2
function confirmarOrden() {
  if (carrito.length === 0) {
    const modalVacio = new bootstrap.Modal(document.getElementById("modalCarritoVacio"));
    modalVacio.show();
    return;
  }

  const envioCheckbox = document.getElementById("envioCheckbox");
  const direccionInput = document.getElementById("direccionInput");

  const envio = envioCheckbox && envioCheckbox.checked;

  // Validación: si hay envío y no hay dirección, mostrar alerta
  if (envio && !direccionInput.value.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Dirección requerida',
      text: 'No podemos realizar el envío si no completás la dirección.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33'
    });
    return;
  }

  const direccion = envio ? direccionInput.value : "Retiro en local";

  const resumenFinal = {
    productos: carrito,
    envio,
    direccion,
    total: document.getElementById("total").textContent
  };

  localStorage.setItem("pedidoFinal", JSON.stringify(resumenFinal));
  localStorage.removeItem("carrito");

  // ✅ Confirmación con SweetAlert2
  Swal.fire({
    icon: 'success',
    title: '¡Orden confirmada!',
    html: `
      <p>Gracias por tu compra.</p>
      <p><strong>Destino:</strong> ${direccion}</p>
      <p><strong>Total:</strong> ${resumenFinal.total}</p>
    `,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#28a745'
  }).then(() => {
    window.location.href = "../index.html"; // ajustá el path si tu index está en otra carpeta
  });
}

// 📦 Cargar combos desde JSON
let productos = [];

async function cargarCombos() {
  try {
    const res = await fetch("../data/combos.json");
    if (!res.ok) throw new Error("No se pudo cargar el menú");
    productos = await res.json();
    renderizarCombos(productos);
  } catch (error) {
    console.error("Error al cargar combos:", error);
  }
}

// 🖼️ Renderizar combos en el DOM
function renderizarCombos(lista) {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.innerHTML = lista.map(c => `
    <div class="col-md-3">
      <div class="card h-100">
        <img src="../${c.imagen}" class="card-img-top" alt="${c.nombre}" />
        <div class="card-body text-center">
          <h5 class="card-title">${c.nombre}</h5>
          <p>$${c.precio}</p>
          <p>${c.descripcion}</p>
          <button class="btn btn-danger agregar-btn"
            data-id="${c.id}"
            data-nombre="${c.nombre}"
            data-precio="${c.precio}">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// 🚀 Ejecutar todo al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  // 🧾 Mostrar resumen y contador
  actualizarResumen();

  // 📦 Mostrar productos en orden.html
  renderizarProductos();

  // 📍 Escuchar cambios en envío con autocompletado
  const envioCheckbox = document.getElementById("envioCheckbox");
  if (envioCheckbox) {
    envioCheckbox.addEventListener("change", () => {
      const direccionContainer = document.getElementById("direccionContainer");
      const direccionInput = document.getElementById("direccionInput");
      direccionContainer.style.display = envioCheckbox.checked ? "block" : "none";

      // ✅ Autocompletado simulado si está vacío
      if (envioCheckbox.checked && direccionInput && !direccionInput.value) {
        direccionInput.value = "Av. Siempre Viva 123, González Catán";
      }

      renderizarProductos();
    });
  }

  // 🧠 Delegación de eventos para botones dinámicos
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".agregar-btn");
    if (!btn) return;
    const id = parseInt(btn.dataset.id);
    const nombre = btn.dataset.nombre;
    const precio = parseInt(btn.dataset.precio);
    carrito.push({ id, nombre, precio });
    guardarCarrito();
    actualizarResumen();
  });

  // 🍔 Cargar combos desde JSON
  cargarCombos();
});

function filtrarPorCategoria(categoria, lista) {
  const filtrados = lista.filter(p => p.categoria === categoria);
  renderizarCombos(filtrados);
}

document.addEventListener("click", (e) => {
  const filtro = e.target.closest(".filtro-btn");
  if (filtro) {
    const categoria = filtro.dataset.categoria;
    if (categoria === "todos") {
      renderizarCombos(productos);
    } else {
      filtrarPorCategoria(categoria, productos);
    }
  }
});

// ✅ Nueva función para validar carrito en el offcanvas
function verificarCarritoAntesDeComprar() {
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'Carrito vacío',
      text: 'No hay productos en tu pedido. Agregá algo antes de continuar.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#d33'
    });
    return;
  }

  // Detectar página actual
  if (window.location.pathname.includes("index.html")) {
    // Si estás en index, redirige a carpeta pages
    window.location.href = "pages/orden.html";
  } else {
    // Si estás en otra página dentro de /pages, redirige relativo
    window.location.href = "orden.html";
  }
}

