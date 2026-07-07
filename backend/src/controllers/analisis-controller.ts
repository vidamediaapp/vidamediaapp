import { Request, Response } from 'express';
import { AnalisisService } from '../services/analisis-service';
import { AppDataSource } from '../db';
import { Usuario } from '../entities/usuario';
import { Deuda } from '../entities/deudas';

export class AnalisisController {
    private analisisService = new AnalisisService(
        AppDataSource.getRepository(Deuda),
        AppDataSource.getRepository(Usuario)
    );

    async analizar(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const resultado = await this.analisisService.analizarSituacion(usuarioId);

            res.status(200).json({
                success: true,
                data: resultado
            });
        } catch (error) {
            console.error('Error en análisis financiero:', error);
            res.status(500).json({
                success: false,
                message: 'Error al analizar situación financiera'
            });
        }
    }
}