import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { SimulacionController } from '../controllers/simulacion-controller';

const router = Router();
const simulacionController = new SimulacionController();

router.post('/', authenticate, simulacionController.simular.bind(simulacionController));

router.post('/guardar', authenticate, simulacionController.guardarSimulacion.bind(simulacionController));

router.get('/historial', authenticate, simulacionController.obtenerHistorial.bind(simulacionController));

router.delete('/:id', authenticate, simulacionController.eliminarSimulacion.bind(simulacionController));

export default router;