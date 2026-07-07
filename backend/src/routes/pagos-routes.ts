import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { PagoController } from '../controllers/pago-controller';

const router = Router();
const pagoController = new PagoController();

// ─── Rutas de Pagos ─────────────────────────────────────────────

// 📌 POST /api/pagos/deudas/:id/pagos - Registrar un pago
router.post('/deudas/:id/pagos', authenticate, pagoController.registrarPago.bind(pagoController));

// 📌 GET /api/pagos/deudas/:id/pagos - Obtener historial de pagos de una deuda
router.get('/deudas/:id/pagos', authenticate, pagoController.obtenerPagosDeuda.bind(pagoController));

export default router;