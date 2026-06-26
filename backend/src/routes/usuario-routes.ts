import express from 'express';
import { authenticate } from '../middlewares/auth';
import { UsuarioService } from '../services/usuario-service';
import { AppDataSource } from '../db';
import { Usuario } from '../entities/usuario';

const usuarioRepository = AppDataSource.getRepository(Usuario);
const usuarioService = new UsuarioService(usuarioRepository);

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Usuario routes');
});

router.post('/register', (req, res) => {

  res.send('Registro de usuario');
});

router.post('/login', (req, res) => {
  // Aquí iría la lógica para autenticar a un usuario
  res.send('Login de usuario');
});

export default router;