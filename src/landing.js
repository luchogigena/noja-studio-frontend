import './style.css';

const nav = document.getElementById('nav-usuario');

function renderNav() {
  const usuarioGuardado = localStorage.getItem('usuario');

  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    nav.innerHTML = `
      <span class="text-stone-600">Hola, ${usuario.nombre}</span>
      <a href="/catalogo.html" class="text-pink-600 font-medium">Ir al catálogo</a>
    `;
  } else {
    nav.innerHTML = `<a href="/login.html" class="text-pink-600 font-medium">Iniciar sesión</a>`;
  }
}

renderNav();