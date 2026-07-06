import { Request, Response } from 'express';
import { SimulacionService } from '../services/simulacion-service';
import { Deuda } from '../entities/deudas';
import { AppDataSource } from '../db';

export class SimulacionController {
    private deudaRepo = AppDataSource.getRepository(Deuda);
    private simulacionService = new SimulacionService();

    async simular(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const { deudaId, montoPropuesto } = req.body;

            if (!deudaId || !montoPropuesto) {
                res.status(400).json({ success: false, message: 'deudaId y montoPropuesto son obligatorios' });
                return;
            }

            const deuda = await this.deudaRepo.findOne({
            where: { id: deudaId, usuario: { id: usuarioId } },
            relations: {
            acreedor: true 
    }
});

            if (!deuda) {
                res.status(404).json({ success: false, message: 'Deuda no encontrada' });
                return;
            }

            const esTarjetaCredito = deuda.acreedor?.tipo === 'retail' || deuda.acreedor?.tipo === 'banco';

            const resultado = this.simulacionService.simular({
                saldoPendiente: deuda.saldo_pendiente,
                tasaInteresAnual: deuda.tasa_interes,
                pagoMensual: montoPropuesto,
                porcentajePagoMinimo: deuda.porcentaje_pago_minimo,
                esTarjetaCredito,
                cuotasSinInteres: deuda.cuotas_sin_interes || 0,
                mantención: deuda.mantencion || 0,
                seguros: deuda.seguros || 0,
                comisiones: deuda.comisiones || 0,
                interesesAcumulados: deuda.intereses_acumulados || 0
            });

            res.status(200).json({
                success: true,
                data: {
                    deudaId: deuda.id,
                    ...resultado
                }
            });
        } catch (error) {
            console.error('Error en simulación:', error);
            res.status(500).json({ success: false, message: 'Error al ejecutar la simulación' });
        }
    }
}