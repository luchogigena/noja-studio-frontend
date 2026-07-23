const CARRITO_KEY = 'carrito';

function obtenerCarrito() {
  const data = localStorage.getItem(CARRITO_KEY);
  return data ? JSON.parse(data) : [];
}

function guardarCarrito(carrito) {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

function agregarAlCarrito(producto, cantidad) {
  const carrito = obtenerCarrito();
  const existente = carrito.find((item) => item.productoId === producto._id);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({
      productoId: producto._id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
    });
  }

  guardarCarrito(carrito);
}

function quitarDelCarrito(productoId) {
  const carrito = obtenerCarrito().filter((item) => item.productoId !== productoId);
  guardarCarrito(carrito);
}

function vaciarCarrito() {
  localStorage.removeItem(CARRITO_KEY);
}

function contarItemsCarrito() {
  return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

export { obtenerCarrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, contarItemsCarrito };