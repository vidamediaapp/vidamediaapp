import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Pagos routes');
});

router.post('/create', (req, res) => {

  res.send('Crear pago');
});

router.get('/:id', (req, res) => {

  res.send(`Obtener pago con ID: ${req.params.id}`);
});     


export default router;