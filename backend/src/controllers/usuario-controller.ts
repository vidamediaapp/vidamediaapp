import { Request, Response } from 'express';
import { UsuarioService } from '../services/usuario-service';

export class UsuarioController {
    constructor(private usuarioService: UsuarioService) {}

    /**
     * GET /api/usuarios (Solo administración)
     */
    async obtenerTodos(req: Request, res: Response): Promise<void> {
        try {
            const usuarios = await this.usuarioService.obtenerTodos();
            res.status(200).json({
                success: true,
                data: usuarios
            });
        } catch (error) {
            console.error('Error al obtener usuarios', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios'
            });
        }
    }


    async obtenerUsuarioPorId(req: Request<{ id: string }>, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const usuario = await this.usuarioService.obtenerUsuarioPorId(id);

            if (!usuario) {
                res.status(404).json({
                    success: false,
                    message: `Usuario con id ${id} no encontrado`
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: usuario
            });
        } catch (error) {
            console.error('Error al obtener usuario por id', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario'
            });
        }
    }

 
    async actualizarPerfil(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
                return;
            }

            const { nombre, apaterno, amaterno, telefono } = req.body;
            const usuarioActualizado = await this.usuarioService.actualizarPerfil(usuarioId, {
                nombre,
                apaterno,
                amaterno,
                telefono
            });

            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: usuarioActualizado
            });
        } catch (error) {
            console.error('Error al actualizar perfil', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al actualizar perfil'
            });
        }
    }

    async cambiarPassword(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
                return;
            }

            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva son requeridas'
                });
                return;
            }

            await this.usuarioService.cambiarPassword(usuarioId, oldPassword, newPassword);

            res.status(200).json({
                success: true,
                message: 'Contraseña cambiada exitosamente'
            });
        } catch (error) {
            console.error('Error al cambiar contraseña', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al cambiar contraseña'
            });
        }
    }


    async eliminarCuenta(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({
                    success: false,
                    message: 'No autorizado'
                });
                return;
            }

            await this.usuarioService.eliminarUsuario(usuarioId);

            res.status(200).json({
                success: true,
                message: 'Cuenta eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar cuenta', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al eliminar cuenta'
            });
        }
    }
}