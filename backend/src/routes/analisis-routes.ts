import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { AnalisisController } from '../controllers/analisis-controller';

const router = Router();
const analisisController = new AnalisisController();

router.get('/', authenticate, analisisController.analizar.bind(analisisController));

export default router;