const API_URL = 'http://localhost:3000/api';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.mensaje || 'Error en la petición');
  }

  return data;
}

export { apiFetch };