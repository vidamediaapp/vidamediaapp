import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { UsuarioController } from '../controllers/usuario-controller';
import { UsuarioService } from '../services/usuario-service';
import { AppDataSource } from '../db';
import { Usuario } from '../entities/usuario';

const router = Router();

// ── Instancias ──────────────────────────────
const usuarioService = new UsuarioService(AppDataSource.getRepository(Usuario));
const usuarioController = new UsuarioController(usuarioService);

router.get('/', authenticate, usuarioController.obtenerTodos.bind(usuarioController));
router.get('/:id', authenticate, usuarioController.obtenerUsuarioPorId.bind(usuarioController));
router.put('/me', authenticate, usuarioController.actualizarPerfil.bind(usuarioController));
router.post('/cambiar-password', authenticate, usuarioController.cambiarPassword.bind(usuarioController));
router.delete('/me', authenticate, usuarioController.eliminarCuenta.bind(usuarioController));

export default router;