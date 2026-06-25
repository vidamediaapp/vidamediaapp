import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Simulaciones routes');
});

router.post('/create', (req, res) => {
  // Aquí iría la lógica para crear una nueva simulación
  res.send('Crear simulación');
});

router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener una simulación por ID
  res.send(`Obtener simulación con ID: ${req.params.id}`);
}); 

export default router;