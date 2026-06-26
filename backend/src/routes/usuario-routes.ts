import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Usuario routes');
});

router.post('/register', (req, res) => {

  res.send('Registro de usuario');
});

router.post('/login', (req, res) => {
  // Aquí iría la lógica para autenticar a un usuario
  res.send('Login de usuario');
});

export default router;