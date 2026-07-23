import './style.css';
import { apiFetch } from './api.js';

const accesoDenegado = document.getElementById('acceso-denegado');
const listaCompras = document.getElementById('lista-compras');

function estaLogueado() {
  return !!localStorage.getItem('token');
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function crearFilaCompra(venta) {
  const div = document.createElement('div');
  div.className = 'bg-white rounded-lg shadow-sm p-4 flex justify-between items-center';

  const imagenUrl = venta.producto?.imagen && venta.producto.imagen.trim() !== ''
    ? venta.producto.imagen
    : 'https://placehold.co/100x100/f5f5f4/a8a29e?text=Sin+imagen';

  div.innerHTML = `
    <div class="flex items-center gap-4">
      <img src="${imagenUrl}" alt="${venta.producto?.nombre || 'Producto'}" class="w-16 h-16 object-cover rounded-md" />
      <div>
        <p class="font-medium text-stone-800">${venta.producto?.nombre || 'Producto eliminado'}</p>
        <p class="text-sm text-stone-500">Cantidad: ${venta.cantidad} · ${formatearFecha(venta.createdAt)}</p>
      </div>
    </div>
    <span class="text-lg font-semibold text-stone-800">$${venta.total}</span>
  `;

  return div;
}

async function cargarMisCompras() {
  if (!estaLogueado()) {
    accesoDenegado.classList.remove('hidden');
    return;
  }

  try {
    const compras = await apiFetch('/ventas/mis-compras');

    if (compras.length === 0) {
      listaCompras.innerHTML = '<p class="text-stone-500">Todavía no hiciste ninguna compra.</p>';
      return;
    }

    compras.forEach((venta) => {
      listaCompras.appendChild(crearFilaCompra(venta));
    });
  } catch (error) {
    listaCompras.innerHTML = `<p class="text-red-600">${error.message}</p>`;
  }
}

cargarMisCompras();