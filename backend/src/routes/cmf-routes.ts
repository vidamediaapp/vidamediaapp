import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { CmfController } from '../controllers/cmf-controller';

const router = Router();
const cmfController = new CmfController();


router.get('/uf', authenticate, cmfController.obtenerUF.bind(cmfController));

export default router;