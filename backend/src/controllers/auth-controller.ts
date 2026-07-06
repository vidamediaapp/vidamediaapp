import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';

export class AuthController {
    constructor(private authService: AuthService) {}


    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, nombre, apaterno, amaterno, telefono, rut } = req.body;


            if (!email || !password || !nombre || !apaterno) {
                res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios: email, password, nombre, apaterno'
                });
                return;
            }

            const nuevoUsuario = await this.authService.register({
                email,
                password,
                nombre,
                apaterno,
                amaterno: amaterno || '',
                telefono: telefono || '',
                rut: rut || ''
            });


            const token = await this.authService.login({ email, password });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    token,
                    usuario: {
                        id: nuevoUsuario.id,
                        email: nuevoUsuario.email,
                        nombre: nuevoUsuario.nombre,
                        apaterno: nuevoUsuario.apaterno,
                        amaterno: nuevoUsuario.amaterno,
                        telefono: nuevoUsuario.telefono
                    }
                }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al registrar usuario'
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son obligatorios'
                });
                return;
            }

            const token = await this.authService.login({ email, password });
            const payload = await this.authService.verifyToken(token);
            const usuario = await this.authService.obtenerUsuarioPorId(payload.id);

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
    }


    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
                return;
            }

            const usuario = await this.authService.obtenerUsuarioPorId(usuarioId);
            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error al obtener perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener información del usuario'
            });
        }
    }


    async logout(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    }
}