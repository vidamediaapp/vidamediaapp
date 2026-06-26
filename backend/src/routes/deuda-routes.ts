import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Deuda routes');
});

router.post('/create', (req, res) => {

  res.send('Crear deuda');
});

router.get('/:id', (req, res) => {

  res.send(`Obtener deuda con ID: ${req.params.id}`);
});

export default router;