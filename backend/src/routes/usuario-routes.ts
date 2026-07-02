import express from 'express';
import { authenticate } from '../middlewares/auth';
import { AuthService } from '../services/auth-service';
import { AppDataSource } from '../db';
import { Usuario } from '../entities/usuario';

const router = express.Router();


const authService = new AuthService(AppDataSource.getRepository(Usuario));


router.post('/register', async (req, res) => {
    try {
        const { email, password, nombre, apaterno, amaterno, telefono } = req.body;

        
        if (!email || !password || !nombre || !apaterno) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: email, password, nombre, apaterno'
            });
        }

        const nuevoUsuario = await authService.register({
            email,
            password,
            nombre,
            apaterno,
            amaterno: amaterno || '',
            telefono: telefono || ''
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: nuevoUsuario
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al registrar usuario'
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son obligatorios'
            });
        }

        const token = await authService.login({ email, password });

        
        const usuario = await authService.obtenerUsuarioPorId(
            (await authService.verifyToken(token)).id
        );

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                token,
                usuario
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(401).json({
            success: false,
            message: error.message || 'Credenciales inválidas'
        });
    }
});


router.get('/me', authenticate, async (req, res) => {
    try {
        const usuarioId = req.user?.id;
        if (!usuarioId) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        const usuario = await authService.obtenerUsuarioPorId(usuarioId);
        res.status(200).json({
            success: true,
            data: usuario
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del usuario'
        });
    }
});


router.post('/logout', authenticate, (req, res) => {
    
    
    res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
});

export default router;