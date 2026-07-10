import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Sube rápido a 10 usuarios
    { duration: '1m', target: 50 },   // Sube a 50 usuarios concurrentes intentando loguearse
    { duration: '20s', target: 0 },   // Baja a 0
  ],
};

export default function () {
  // 1. URL de tu endpoint de autenticación (Cambia el localhost por tu puerto real)
  const url = 'http://localhost:3000/api/auth/login'; 
  
  // 2. Datos ficticios que el test enviará simulando el formulario
  const payload = JSON.stringify({
    email: 'nuevo@mail.com',
    password: '12345678'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // 3. Envía la petición POST (igual que hace tu botón "Iniciar sesión")
  const res = http.post(url, payload, params);

  // 4. Verificaciones
  check(res, {
    'Login exitoso (status 200 o 201)': (r) => r.status === 200 || r.status === 201,
    'Respuesta rápida (< 800ms)': (r) => r.timings.duration < 800,
  });

  sleep(1); // Espera 1 segundo antes de que este usuario virtual vuelva a intentar
}