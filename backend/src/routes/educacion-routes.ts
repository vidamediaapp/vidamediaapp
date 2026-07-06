import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { EducacionController } from '../controllers/educacion-controller';

const router = Router();
const educacionController = new EducacionController();

router.get('/articulos', authenticate, educacionController.getArticulos.bind(educacionController));
router.post('/chatbot', authenticate, educacionController.getChatbotResponse.bind(educacionController));

export default router;