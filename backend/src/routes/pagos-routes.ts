import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Pagos routes');
});

router.post('/create', (req, res) => {
  // Aquí iría la lógica para crear un nuevo pago
  res.send('Crear pago');
});

router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener un pago por ID
  res.send(`Obtener pago con ID: ${req.params.id}`);
});     

export default router;