import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { PresupuestoController } from '../controllers/presupuesto-controller';
import { PresupuestoService } from '../services/presupuestos-service';
import { AppDataSource } from '../db';
import { Presupuesto } from '../entities/presupuesto';

const router = Router();

const presupuestoRepository = AppDataSource.getRepository(Presupuesto);
const presupuestoService = new PresupuestoService(presupuestoRepository);
const presupuestoController = new PresupuestoController(presupuestoService);


router.get('/:mes/:año', authenticate, presupuestoController.obtenerPresupuesto.bind(presupuestoController));
router.post('/', authenticate, presupuestoController.guardarPresupuesto.bind(presupuestoController));
router.get('/historial', authenticate, presupuestoController.obtenerHistorial.bind(presupuestoController));

export default router;