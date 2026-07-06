import { Request, Response } from 'express';
import { PresupuestoService } from '../services/presupuestos-service';

export class PresupuestoController {
    constructor(private presupuestoService: PresupuestoService) {}

    /**
     * GET /api/presupuesto/:mes/:año
     */
    async obtenerPresupuesto(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const mes = parseInt(req.params.mes as string);
            const año = parseInt(req.params.año as string);

            if (isNaN(mes) || isNaN(año) || mes < 1 || mes > 12) {
                res.status(400).json({ success: false, message: 'Mes y año inválidos' });
                return;
            }

           
            const presupuesto = await this.presupuestoService.obtenerPresupuesto(usuarioId, mes, año);

            if (!presupuesto) {
                res.status(404).json({ success: false, message: 'Presupuesto no encontrado' });
                return;
            }

            res.status(200).json({ success: true, data: presupuesto });
        } catch (error) {
            console.error('Error al obtener presupuesto:', error);
            res.status(500).json({ success: false, message: 'Error al obtener presupuesto' });
        }
    }

    /**
     * POST /api/presupuesto
     */
    async guardarPresupuesto(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const { mes, año, salario, extras, pagosPlanificados } = req.body;

            if (!mes || !año || isNaN(mes) || isNaN(año) || mes < 1 || mes > 12) {
                res.status(400).json({ success: false, message: 'Mes y año inválidos' });
                return;
            }

            // ✅ Esto devuelve Presupuesto (un objeto)
            const presupuesto = await this.presupuestoService.guardarPresupuesto(
                {
                    mes,
                    año,
                    salario: salario || 0,
                    extras: extras || 0,
                    pagosPlanificados: pagosPlanificados || {}
                },
                usuarioId
            );

            res.status(201).json({
                success: true,
                message: 'Presupuesto guardado exitosamente',
                data: presupuesto
            });
        } catch (error) {
            console.error('Error al guardar presupuesto:', error);
            res.status(500).json({ success: false, message: 'Error al guardar presupuesto' });
        }
    }

    /**
     * GET /api/presupuesto/historial
     */
    async obtenerHistorial(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            // ✅ Esto devuelve Presupuesto[] (un arreglo)
            const historial = await this.presupuestoService.obtenerHistorial(usuarioId);

            res.status(200).json({ success: true, data: historial });
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ success: false, message: 'Error al obtener historial' });
        }
    }
}