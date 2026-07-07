import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { ComunidadController } from '../controllers/comunidad-controller';

const router = Router();
const comunidadController = new ComunidadController();

router.get('/testimonios', authenticate, comunidadController.obtenerTestimonios.bind(comunidadController));
router.post('/testimonios', authenticate, comunidadController.crearTestimonio.bind(comunidadController));
router.post('/testimonios/:id/votar', authenticate, comunidadController.votarTestimonio.bind(comunidadController));

router.get('/foro', authenticate, comunidadController.obtenerPublicaciones.bind(comunidadController));
router.post('/foro', authenticate, comunidadController.crearPublicacion.bind(comunidadController));
router.post('/foro/:id/comentarios', authenticate, comunidadController.agregarComentario.bind(comunidadController));
router.post('/foro/:id/votar', authenticate, comunidadController.votarPublicacion.bind(comunidadController));

export default router;