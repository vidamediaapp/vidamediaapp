import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { AuthController } from '../controllers/auth-controller';
import { AuthService } from '../services/auth-service';
import { AppDataSource } from '../db';
import { Usuario } from '../entities/usuario';

const router = Router();


const authService = new AuthService(AppDataSource.getRepository(Usuario));
const authController = new AuthController(authService);

router.post('/registro', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', authenticate, authController.getProfile.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

export default router;