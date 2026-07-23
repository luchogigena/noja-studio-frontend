import './style.css';
import { apiFetch } from './api.js';

const form = document.getElementById('form-registro');
const mensajeError = document.getElementById('mensaje-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mensajeError.classList.add('hidden');

  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const data = await apiFetch('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password }),
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    window.location.href = '/catalogo.html';
  } catch (error) {
    mensajeError.textContent = error.message;
    mensajeError.classList.remove('hidden');
  }
});