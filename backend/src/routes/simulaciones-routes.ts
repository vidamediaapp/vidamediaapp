import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Simulaciones routes');
});

router.post('/create', (req, res) => {

  res.send('Crear simulación');
});

router.get('/:id', (req, res) => {

  res.send(`Obtener simulación con ID: ${req.params.id}`);
}); 

export default router;