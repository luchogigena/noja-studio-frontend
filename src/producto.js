import './style.css';
import { apiFetch } from './api.js';

const contenedor = document.getElementById('detalle-producto');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');

function estaLogueado() {
  return !!localStorage.getItem('token');
}

function obtenerIdDeUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function renderProducto(producto) {
  const imagenUrl = producto.imagen && producto.imagen.trim() !== ''
    ? producto.imagen
    : 'https://placehold.co/500x400/f5f5f4/a8a29e?text=Sin+imagen';

  const sinStock = producto.stock === 0;

  contenedor.innerHTML = `
    <img src="${imagenUrl}" alt="${producto.nombre}" class="w-full h-80 object-cover rounded-md" />
    <div class="flex flex-col">
      <span class="text-xs uppercase text-pink-600 font-medium mb-2">${producto.categoria}</span>
      <h2 class="text-2xl font-bold text-stone-800 mb-3">${producto.nombre}</h2>
      <p class="text-stone-600 mb-6 flex-1">${producto.descripcion || 'Sin descripción disponible.'}</p>

      <div class="flex justify-between items-center mb-4">
        <span class="text-2xl font-bold text-stone-800">$${producto.precio}</span>
        <span class="text-sm text-stone-400">Stock disponible: ${producto.stock}</span>
      </div>

      <button
        id="btn-comprar"
        class="w-full ${sinStock ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-pink-600 text-white hover:bg-pink-700'} font-medium py-3 rounded-md transition"
        ${sinStock ? 'disabled' : ''}
      >
        ${sinStock ? 'Sin stock' : 'Comprar'}
      </button>
    </div>
  `;

  if (!sinStock) {
    document.getElementById('btn-comprar').addEventListener('click', () => manejarCompra(producto));
  }
}

async function manejarCompra(producto) {
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

  const btnComprar = document.getElementById('btn-comprar');
  btnComprar.disabled = true;
  btnComprar.textContent = 'Procesando...';

  try {
    await apiFetch('/ventas', {
      method: 'POST',
      body: JSON.stringify({ productoId: producto._id, cantidad }),
    });

    mensajeExito.textContent = '¡Compra realizada con éxito!';
    mensajeExito.classList.remove('hidden');
    setTimeout(() => mensajeExito.classList.add('hidden'), 4000);

    await cargarProducto();
  } catch (error) {
    mensajeError.textContent = error.message;
    mensajeError.classList.remove('hidden');
    setTimeout(() => mensajeError.classList.add('hidden'), 4000);

    btnComprar.disabled = false;
    btnComprar.textContent = 'Comprar';
  }
}

async function cargarProducto() {
  const id = obtenerIdDeUrl();

  if (!id) {
    contenedor.innerHTML = '<p class="text-stone-500 sm:col-span-2">No se especificó ningún producto.</p>';
    return;
  }

  try {
    const producto = await apiFetch(`/productos/${id}`);
    renderProducto(producto);
  } catch (error) {
    contenedor.innerHTML = `<p class="text-red-600 sm:col-span-2">${error.message}</p>`;
  }
}

cargarProducto();