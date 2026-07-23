import './style.css';
import { apiFetch } from './api.js';
import { agregarAlCarrito, contarItemsCarrito } from './carrito.js';

const grid = document.getElementById('grid-productos');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');
const nav = document.getElementById('nav-usuario');

function estaLogueado() {
  return !!localStorage.getItem('token');
}

function actualizarContadorCarrito() {
  const badge = document.getElementById('contador-carrito');
  if (badge) {
    const total = contarItemsCarrito();
    badge.textContent = total > 0 ? `Carrito (${total})` : 'Carrito';
  }
}

function renderNav() {
  const usuarioGuardado = localStorage.getItem('usuario');
  const linkCarrito = `<a href="/carrito.html" id="contador-carrito" class="text-stone-600 hover:text-pink-600">Carrito</a>`;

  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    nav.innerHTML = `
      <span class="text-stone-600">Hola, ${usuario.nombre}</span>
      <a href="/mis-compras.html" class="text-stone-600 hover:text-pink-600">Mis compras</a>
      ${linkCarrito}
      ${usuario.rol === 'admin' ? '<a href="/admin.html" class="text-pink-600 font-medium">Panel admin</a>' : ''}
      <button id="btn-logout" class="text-stone-500 hover:text-pink-600">Cerrar sesión</button>
    `;

    document.getElementById('btn-logout').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.reload();
    });
  } else {
    nav.innerHTML = `${linkCarrito} <a href="/login.html" class="text-pink-600 font-medium">Iniciar sesión</a>`;
  }

  actualizarContadorCarrito();
}

function crearTarjetaProducto(producto) {
  const div = document.createElement('div');
  div.className = 'bg-white rounded-lg shadow-sm overflow-hidden flex flex-col';

  const imagenUrl = producto.imagen && producto.imagen.trim() !== ''
    ? producto.imagen
    : 'https://placehold.co/400x300/f5f5f4/a8a29e?text=Sin+imagen';

  const sinStock = producto.stock === 0;

  div.innerHTML = `
    <a href="/producto.html?id=${producto._id}">
      <img src="${imagenUrl}" alt="${producto.nombre}" class="w-full h-48 object-cover" />
    </a>
    <div class="p-4 flex flex-col flex-1">
      <span class="text-xs uppercase text-pink-600 font-medium mb-1">${producto.categoria}</span>
      <a href="/producto.html?id=${producto._id}" class="hover:text-pink-600">
        <h3 class="text-lg font-semibold text-stone-800">${producto.nombre}</h3>
      </a>
      <p class="text-stone-500 text-sm mt-1 flex-1">${producto.descripcion || ''}</p>
      <div class="flex justify-between items-center mt-4 mb-3">
        <span class="text-lg font-bold text-stone-800">$${producto.precio}</span>
        <span class="text-sm text-stone-400">Stock: ${producto.stock}</span>
      </div>
      <button
        class="btn-comprar w-full ${sinStock ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-pink-600 text-white hover:bg-pink-700'} font-medium py-2 rounded-md transition"
        ${sinStock ? 'disabled' : ''}
      >
        ${sinStock ? 'Sin stock' : 'Comprar'}
      </button>
      <button class="btn-agregar-carrito w-full mt-2 border border-pink-600 text-pink-600 font-medium py-2 rounded-md hover:bg-pink-50 transition ${sinStock ? 'hidden' : ''}">
        Agregar al carrito
      </button>
    </div>
  `;

  const btnComprar = div.querySelector('.btn-comprar');

  if (!sinStock) {
    btnComprar.addEventListener('click', () => manejarCompra(producto, btnComprar));
  }

  const btnAgregarCarrito = div.querySelector('.btn-agregar-carrito');
  if (btnAgregarCarrito) {
    btnAgregarCarrito.addEventListener('click', () => {
      agregarAlCarrito(producto, 1);
      actualizarContadorCarrito();
      mensajeExito.textContent = `"${producto.nombre}" agregado al carrito`;
      mensajeExito.classList.remove('hidden');
      setTimeout(() => mensajeExito.classList.add('hidden'), 2500);
    });
  }

  return div;
}

async function manejarCompra(producto, btnComprar) {
  if (!estaLogueado()) {
    window.location.href = '/login.html';
    return;
  }

  const cantidadTexto = prompt(`¿Cuántas unidades de "${producto.nombre}" querés comprar?`, '1');
  if (cantidadTexto === null) return;

  const cantidad = Number(cantidadTexto);
  if (!Number.isInteger(cantidad) || cantidad <= 0) {
    alert('Ingresá una cantidad válida');
    return;
  }

  btnComprar.disabled = true;
  btnComprar.textContent = 'Procesando...';

  try {
    await apiFetch('/ventas', {
      method: 'POST',
      body: JSON.stringify({ productoId: producto._id, cantidad }),
    });

    await cargarProductos();

    mensajeExito.textContent = `¡Compra de "${producto.nombre}" realizada con éxito!`;
    mensajeExito.classList.remove('hidden');
    setTimeout(() => mensajeExito.classList.add('hidden'), 4000);
  } catch (error) {
    mensajeError.textContent = error.message;
    mensajeError.classList.remove('hidden');
    setTimeout(() => mensajeError.classList.add('hidden'), 4000);

    btnComprar.disabled = false;
    btnComprar.textContent = 'Comprar';
  }
}

async function cargarProductos() {
  try {
    const productos = await apiFetch('/productos');
    grid.innerHTML = '';

    if (productos.length === 0) {
      grid.innerHTML = '<p class="text-stone-500 col-span-full">Todavía no hay productos cargados.</p>';
      return;
    }

    productos.forEach((producto) => {
      grid.appendChild(crearTarjetaProducto(producto));
    });
  } catch (error) {
    mensajeError.textContent = error.message;
    mensajeError.classList.remove('hidden');
  }
}

renderNav();
cargarProductos();