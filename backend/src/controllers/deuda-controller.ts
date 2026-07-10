import { Request, Response } from 'express';
import { DeudaService } from '../services/deuda-service';
import { AppDataSource } from '../db';
import { Deuda } from '../entities/deudas';

export class DeudaController {
    private deudaService = new DeudaService(AppDataSource.getRepository(Deuda));

    async obtenerDeudas(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const deudas = await this.deudaService.obtenerDeudas(usuarioId);
            res.status(200).json({ success: true, data: deudas });
        } catch (error) {
            console.error('Error al obtener deudas:', error);
            res.status(500).json({ success: false, message: 'Error al obtener deudas' });
        }
    }

    async obtenerDeudaPorId(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            // ✅ CORREGIDO: convertir id a string
            const id = req.params.id as string;
            const deuda = await this.deudaService.obtenerDeudaPorId(id, usuarioId);

            if (!deuda) {
                res.status(404).json({ success: false, message: 'Deuda no encontrada' });
                return;
            }

            res.status(200).json({ success: true, data: deuda });
        } catch (error) {
            console.error('Error al obtener deuda:', error);
            res.status(500).json({ success: false, message: 'Error al obtener deuda' });
        }
    }

    async crearDeuda(req: Request, res: Response): Promise<void> {
    try {
        const usuarioId = req.user?.id;
        if (!usuarioId) {
            res.status(401).json({ success: false, message: 'No autorizado' });
            return;
        }

        const deuda = await this.deudaService.crearDeuda(req.body, usuarioId);
        res.status(201).json({ success: true, message: 'Deuda creada exitosamente', data: deuda });
    } catch (error) {
        console.error('Error al crear deuda:', error);
        res.status(400).json({ success: false, message: error.message || 'Error al crear deuda' });
    }
}

    async actualizarDeuda(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }


            const id = req.params.id as string;
            const deuda = await this.deudaService.actualizarDeuda(id, req.body, usuarioId);

            if (!deuda) {
                res.status(404).json({ success: false, message: 'Deuda no encontrada' });
                return;
            }

            res.status(200).json({ success: true, message: 'Deuda actualizada', data: deuda });
        } catch (error) {
            console.error('Error al actualizar deuda:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar deuda' });
        }
    }

    async eliminarDeuda(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

    
            const id = req.params.id as string;
            const eliminado = await this.deudaService.eliminarDeuda(id, usuarioId);

            if (!eliminado) {
                res.status(404).json({ success: false, message: 'Deuda no encontrada' });
                return;
            }

            res.status(200).json({ success: true, message: 'Deuda eliminada' });
        } catch (error) {
            console.error('Error al eliminar deuda:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar deuda' });
        }
    }
}