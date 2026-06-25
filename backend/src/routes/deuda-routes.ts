import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Deuda routes');
});

router.post('/create', (req, res) => {
  // Aquí iría la lógica para crear una nueva deuda
  res.send('Crear deuda');
});

router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener una deuda por ID
  res.send(`Obtener deuda con ID: ${req.params.id}`);
});

export default router;