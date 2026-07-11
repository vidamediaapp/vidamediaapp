import { Router } from 'express';
import { CmfController } from '../controllers/cmf-controller';

const router = Router();
const cmfController = new CmfController();

router.get('/uf', cmfController.obtenerUF.bind(cmfController));

export default router;