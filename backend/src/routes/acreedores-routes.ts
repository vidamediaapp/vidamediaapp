import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Acreedores routes');
});

router.post('/create', (req, res) => {
  // Aquí iría la lógica para crear un nuevo acreedor
  res.send('Crear acreedor');
});

router.get('/:id', (req, res) => {
  // Aquí iría la lógica para obtener un acreedor por ID
  res.send(`Obtener acreedor con ID: ${req.params.id}`);
});
export default router;