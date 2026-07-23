import './style.css';
import { apiFetch } from './api.js';
import { obtenerCarrito, quitarDelCarrito, vaciarCarrito } from './carrito.js';

const listaCarrito = document.getElementById('lista-carrito');
const resumenCarrito = document.getElementById('resumen-carrito');
const totalCarrito = document.getElementById('total-carrito');
const btnConfirmar = document.getElementById('btn-confirmar');
const mensajeError = document.getElementById('mensaje-error');
const mensajeExito = document.getElementById('mensaje-exito');

function calcularTotal(carrito) {
  return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

function crearFilaCarrito(item) {
  const div = document.createElement('div');
  div.className = 'bg-white rounded-lg shadow-sm p-4 flex justify-between items-center';

  const imagenUrl = item.imagen && item.imagen.trim() !== ''
    ? item.imagen
    : 'https://placehold.co/100x100/f5f5f4/a8a29e?text=Sin+imagen';

  div.innerHTML = `
    <div class="flex items-center gap-4">
      <img src="${imagenUrl}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded-md" />
      <div>
        <p class="font-medium text-stone-800">${item.nombre}</p>
        <p class="text-sm text-stone-500">Cantidad: ${item.cantidad} · $${item.precio} c/u</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <span class="font-semibold text-stone-800">$${item.precio * item.cantidad}</span>
      <button class="btn-quitar text-red-600 text-sm hover:underline">Quitar</button>
    </div>
  `;

  div.querySelector('.btn-quitar').addEventListener('click', () => {
    quitarDelCarrito(item.productoId);
    renderCarrito();
  });

  return div;
}

function renderCarrito() {
  const carrito = obtenerCarrito();
  listaCarrito.innerHTML = '';

  if (carrito.length === 0) {
    listaCarrito.innerHTML = '<p class="text-stone-500">Tu carrito está vacío.</p>';
    resumenCarrito.classList.add('hidden');
    return;
  }

  carrito.forEach((item) => {
    listaCarrito.appendChild(crearFilaCarrito(item));
  });

  totalCarrito.textContent = `$${calcularTotal(carrito)}`;
  resumenCarrito.classList.remove('hidden');
}

async function confirmarCompra() {
  const carrito = obtenerCarrito();
  if (carrito.length === 0) return;

  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
    return;
  }

  btnConfirmar.disabled = true;
  btnConfirmar.textContent = 'Procesando...';

  try {
    for (const item of carrito) {
      await apiFetch('/ventas', {
        method: 'POST',
        body: JSON.stringify({ productoId: item.productoId, cantidad: item.cantidad }),
      });
    }

    vaciarCarrito();
    mensajeExito.textContent = '¡Compra confirmada con éxito!';
    mensajeExito.classList.remove('hidden');
    renderCarrito();
  } catch (error) {
    mensajeError.textContent = `Hubo un problema con la compra: ${error.message}`;
    mensajeError.classList.remove('hidden');
  } finally {
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = 'Confirmar compra';
  }
}

btnConfirmar.addEventListener('click', confirmarCompra);

renderCarrito();