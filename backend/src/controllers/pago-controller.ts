import { Request, Response } from 'express';
import { PagoService } from '../services/pago-service';
import { AppDataSource } from '../db';
import { Pago } from '../entities/pagos';
import { Deuda } from '../entities/deudas';

export class PagoController {
    private pagoService = new PagoService(
        AppDataSource.getRepository(Pago),
        AppDataSource.getRepository(Deuda)
    );

    async registrarPago(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

           
            const id = req.params.id as string;
            const { monto } = req.body;

            if (!monto || monto <= 0) {
                res.status(400).json({ success: false, message: 'Monto inválido' });
                return;
            }

            const pago = await this.pagoService.registrarPago(id, monto, usuarioId);
            res.status(201).json({
                success: true,
                message: 'Pago registrado exitosamente',
                data: pago
            });
        } catch (error) {
            console.error('Error al registrar pago:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al registrar pago'
            });
        }
    }

    async obtenerPagosDeuda(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const id = req.params.id as string;
            const pagos = await this.pagoService.obtenerPagosDeuda(id, usuarioId);
            res.status(200).json({
                success: true,
                data: pagos
            });
        } catch (error) {
            console.error('Error al obtener pagos:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error al obtener pagos'
            });
        }
    }
}