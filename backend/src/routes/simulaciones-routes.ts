import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { SimulacionController } from '../controllers/simulacion-controller';

const router = Router();
const simulacionController = new SimulacionController();

router.post('/', authenticate, simulacionController.simular.bind(simulacionController));

export default router;