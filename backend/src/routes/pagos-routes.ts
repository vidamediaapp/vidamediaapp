import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { PagoController } from '../controllers/pago-controller';

const router = Router();
const pagoController = new PagoController();

router.get('/', authenticate, pagoController.obtenerTodosPagos.bind(pagoController));

router.post('/deudas/:id/pagos', authenticate, pagoController.registrarPago.bind(pagoController));


router.get('/deudas/:id/pagos', authenticate, pagoController.obtenerPagosDeuda.bind(pagoController));



router.delete('/deudas/:id/pagos/:pagoId', authenticate, pagoController.eliminarPago.bind(pagoController));

export default router;