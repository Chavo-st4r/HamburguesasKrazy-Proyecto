// 🛒 Inicializar carrito desde localStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// 🧾 Actualizar resumen en el offcanvas y contador
function actualizarResumen() {
  const resumen = document.getElementById("resumen-pedido");
  const contador = document.getElementById("contador-carrito");

  if (resumen) resumen.innerHTML = "";

  carrito.forEach((item, index) => {
    if (resumen) {
      const div = document.createElement("div");
      div.className = "d-flex justify-content-between align-items-center mb-2";
      div.innerHTML = `
        <span>${item.nombre} - $${item.precio}</span>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem(${index})">Eliminar</button>
      `;
      resumen.appendChild(div);
    }
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

// ✅ Confirmar orden en orden.html
function confirmarOrden() {
  if (carrito.length === 0) {
    const modalVacio = new bootstrap.Modal(document.getElementById("modalCarritoVacio"));
    modalVacio.show();
    return;
  }

  const envioCheckbox = document.getElementById("envioCheckbox");
  const direccionInput = document.getElementById("direccionInput");

  const envio = envioCheckbox && envioCheckbox.checked;
  const direccion = envio ? direccionInput.value : "Retiro en local";

  const resumenFinal = {
    productos: carrito,
    envio,
    direccion,
    total: document.getElementById("total").textContent
  };

  localStorage.setItem("pedidoFinal", JSON.stringify(resumenFinal));
  localStorage.removeItem("carrito");

  const modalConfirmacion = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
  modalConfirmacion.show();
}

// 🚀 Ejecutar todo al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
  // 🧠 Conectar botones de agregar al carrito
  const botones = document.querySelectorAll('.agregar-btn');
  if (botones.length > 0) {
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const nombre = btn.dataset.nombre;
        const precio = parseInt(btn.dataset.precio);
        carrito.push({ id, nombre, precio });
        guardarCarrito();
        actualizarResumen();
      });
    });
  }

  // 🧾 Mostrar resumen y contador
  actualizarResumen();

  // 📦 Mostrar productos en orden.html
  renderizarProductos();

  // 📍 Escuchar cambios en envío
  const envioCheckbox = document.getElementById("envioCheckbox");
  if (envioCheckbox) {
    envioCheckbox.addEventListener("change", () => {
      const direccionContainer = document.getElementById("direccionContainer");
      direccionContainer.style.display = envioCheckbox.checked ? "block" : "none";
      renderizarProductos();
    });
  }
});
