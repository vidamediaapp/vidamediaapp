import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { DeudaController } from '../controllers/deuda-controller';

const router = Router();
const deudaController = new DeudaController();

router.get('/', authenticate, deudaController.obtenerDeudas.bind(deudaController));
router.get('/:id', authenticate, deudaController.obtenerDeudaPorId.bind(deudaController));
router.post('/', authenticate, deudaController.crearDeuda.bind(deudaController));
router.put('/:id', authenticate, deudaController.actualizarDeuda.bind(deudaController));
router.delete('/:id', authenticate, deudaController.eliminarDeuda.bind(deudaController));

export default router;