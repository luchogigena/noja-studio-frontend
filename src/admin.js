import './style.css';
import { apiFetch } from './api.js';

const accesoDenegado = document.getElementById('acceso-denegado');
const contenidoAdmin = document.getElementById('contenido-admin');
const form = document.getElementById('form-producto');
const listaProductos = document.getElementById('lista-productos');
const mensajeForm = document.getElementById('mensaje-form');
const tituloFormulario = document.getElementById('titulo-formulario');
const btnCancelar = document.getElementById('btn-cancelar');


// --- Control de acceso ---
function verificarAcceso() {
  const usuarioGuardado = localStorage.getItem('usuario');
  const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

  if (!usuario || usuario.rol !== 'admin') {
    accesoDenegado.classList.remove('hidden');
    return false;
  }

  contenidoAdmin.classList.remove('hidden');
  return true;
}

// --- Mostrar mensajes del formulario ---
function mostrarMensaje(texto, tipo = 'error') {
  mensajeForm.textContent = texto;
  mensajeForm.className = `sm:col-span-2 text-sm ${tipo === 'error' ? 'text-red-600' : 'text-green-600'}`;
}

// --- Renderizar la lista de productos ---
function crearFilaProducto(producto) {
  const div = document.createElement('div');
  div.className = 'py-3 flex justify-between items-center';

  div.innerHTML = `
    <div>
      <p class="font-medium text-stone-800">${producto.nombre}</p>
      <p class="text-sm text-stone-500">$${producto.precio} · Stock: ${producto.stock} · ${producto.categoria}</p>
    </div>
    <div class="flex gap-2">
  <button class="btn-editar bg-pink-50 text-pink-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-pink-100 transition">Editar</button>
  <button class="btn-eliminar bg-red-50 text-red-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-100 transition">Eliminar</button>
</div>
  `;

  div.querySelector('.btn-editar').addEventListener('click', () => cargarEnFormulario(producto));
  div.querySelector('.btn-eliminar').addEventListener('click', () => eliminarProducto(producto._id));

  return div;
}

async function cargarProductos() {
  const productos = await apiFetch('/productos');
  listaProductos.innerHTML = '';
  productos.forEach((producto) => {
    listaProductos.appendChild(crearFilaProducto(producto));
  });
}

// --- Cargar un producto en el formulario para editarlo ---
function cargarEnFormulario(producto) {
  document.getElementById('producto-id').value = producto._id;
  document.getElementById('nombre').value = producto.nombre;
  document.getElementById('categoria').value = producto.categoria;
  document.getElementById('descripcion').value = producto.descripcion || '';
  document.getElementById('precio').value = producto.precio;
  document.getElementById('stock').value = producto.stock;
  document.getElementById('imagen').value = producto.imagen || '';

  tituloFormulario.textContent = `Editando: ${producto.nombre}`;
  btnCancelar.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limpiarFormulario() {
  form.reset();
  document.getElementById('producto-id').value = '';
  tituloFormulario.textContent = 'Nuevo producto';
  btnCancelar.classList.add('hidden');
}

btnCancelar.addEventListener('click', limpiarFormulario);

// --- Crear o actualizar (según si hay id cargado) ---
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('producto-id').value;

  const body = {
    nombre: document.getElementById('nombre').value,
    categoria: document.getElementById('categoria').value,
    descripcion: document.getElementById('descripcion').value,
    precio: Number(document.getElementById('precio').value),
    stock: Number(document.getElementById('stock').value),
      imagen: document.getElementById('imagen').value,

  };

  try {
    if (id) {
      await apiFetch(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) });
      mostrarMensaje('Producto actualizado correctamente', 'exito');
    } else {
      await apiFetch('/productos', { method: 'POST', body: JSON.stringify(body) });
      mostrarMensaje('Producto creado correctamente', 'exito');
    }

    limpiarFormulario();
    cargarProductos();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
});

// --- Eliminar producto ---
async function eliminarProducto(id) {
  const confirmar = confirm('¿Seguro que querés eliminar este producto?');
  if (!confirmar) return;

  try {
    await apiFetch(`/productos/${id}`, { method: 'DELETE' });
    cargarProductos();
  } catch (error) {
    alert(error.message);
  }
}

// --- Inicio ---
if (verificarAcceso()) {
  cargarProductos();
}