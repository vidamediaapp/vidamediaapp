import { Request, Response } from 'express';
import { SimulacionService } from '../services/simulacion-service';
import { Deuda } from '../entities/deudas';
import { Simulacion } from '../entities/simulaciones';
import { AppDataSource } from '../db';

export class SimulacionController {
    private deudaRepo = AppDataSource.getRepository(Deuda);
    private simulacionRepo = AppDataSource.getRepository(Simulacion);
    private simulacionService = new SimulacionService();

    async simular(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const { deudaId, montoPropuesto, extraPayment } = req.body;

            if (!deudaId || !montoPropuesto) {
                res.status(400).json({ 
                    success: false, 
                    message: 'deudaId y montoPropuesto son obligatorios' 
                });
                return;
            }

            const deuda = await this.deudaRepo.findOne({
                where: { id: deudaId, usuario: { id: usuarioId } },
                relations: { acreedor: true }
            });

            if (!deuda) {
                res.status(404).json({ success: false, message: 'Deuda no encontrada' });
                return;
            }

            const esTarjetaCredito = deuda.acreedor?.tipo === 'retail' || deuda.acreedor?.tipo === 'banco';

            const resultadoComparativo = this.simulacionService.simularConComparacion({
                saldoPendiente: deuda.saldo_pendiente,
                tasaInteresAnual: deuda.tasa_interes,
                pagoMensual: montoPropuesto,
                extraPayment: extraPayment || 0,
                porcentajePagoMinimo: deuda.porcentaje_pago_minimo,
                esTarjetaCredito,
                cuotasSinInteres: deuda.cuotas_sin_interes || 0,
                mantención: deuda.mantencion || 0,
                seguros: deuda.seguros || 0,
                comisiones: deuda.comisiones || 0,
                interesesAcumulados: deuda.intereses_acumulados || 0
            });

            const maxMeses = Math.max(
                resultadoComparativo.sinExtra.mesesProyectados,
                resultadoComparativo.conExtra.mesesProyectados
            );

            const proyeccionMensual = this.generarProyeccionMensual(
                deuda.saldo_pendiente,
                deuda.tasa_interes,
                montoPropuesto,
                extraPayment || 0,
                maxMeses
            );

            const cuotasRestantes = Math.max(1, deuda.totalCuotas - deuda.cuotasPagadas);
            const pagoMinimoReal = Math.ceil(
                (deuda.saldo_pendiente / cuotasRestantes) + 
                (deuda.saldo_pendiente * (deuda.tasa_interes / 100))
            );

            const paidPercent = deuda.saldo_pendiente > 0 
                ? Math.round((1 - (resultadoComparativo.conExtra.totalPagado - deuda.saldo_pendiente) / deuda.saldo_pendiente) * 100)
                : 100;

            res.status(200).json({
                success: true,
                data: {
                    deudaId: deuda.id,
                    monthsWithout: resultadoComparativo.sinExtra.mesesProyectados,
                    monthsWith: resultadoComparativo.conExtra.mesesProyectados,
                    monthsSaved: resultadoComparativo.mesesAhorrados,
                    totalPaidWithout: resultadoComparativo.sinExtra.totalPagado,
                    totalPaidWith: resultadoComparativo.conExtra.totalPagado,
                    interestSavedCLP: resultadoComparativo.interesAhorrado,
                    esTrampa: resultadoComparativo.sinExtra.esTrampa,
                    pagoMinimoCMF: pagoMinimoReal,
                    faseCMF: resultadoComparativo.sinExtra.faseCMF,
                    paidPercent: paidPercent,
                    projection: proyeccionMensual
                }
            });
        } catch (error) {
            console.error('Error en simulacion:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al ejecutar la simulacion' 
            });
        }
    }

    async guardarSimulacion(req: Request, res: Response): Promise<void> {
        try {
            const usuarioId = req.user?.id;
            if (!usuarioId) {
                res.status(401).json({ success: false, message: 'No autorizado' });
                return;
            }

            const { deudaId, montoPropuesto, resultado } = req.body;

            if (!deudaId || !montoPropuesto) {
                res.status(400).json({ success: false, message: 'deudaId y montoPropuesto son obligatorios' });
                return;
            }

            const deuda = await this.deudaRepo.findOne({
                where: { id: deudaId, usuario: { id: usuarioId } }
            });

            if (!deuda) {
                res.status(404).json({ success: false, message: 'Deuda no encontrada' });
                return;
            }

            const simulacion = this.simulacionRepo.create({
                usuario: { id: usuarioId },
                deuda: { id: deudaId },
                monto_original: deuda.monto_original,
                saldo_pendiente: deuda.saldo_pendiente,
                tasa_interes: deuda.tasa_interes,
                porcentaje_pago_minimo: deuda.porcentaje_pago_minimo,
                fecha_limite: deuda.fecha_limite,
                monto_propuesto: montoPropuesto,
                meses_proyectados: resultado?.monthsWithout || 0,
                interes_proyectado: resultado?.interestSavedCLP || 0,
                total_pagado: resultado?.totalPaidWithout || 0,
                es_trampa: resultado?.esTrampa || false,
                fecha_simulacion: new Date()
            });

            await this.simulacionRepo.save(simulacion);

            res.status(201).json({
                success: true,
                message: 'Simulacion guardada exitosamente',
                data: simulacion
            });
        } catch (error) {
            console.error('Error al guardar simulacion:', error);
            res.status(500).json({ success: false, message: 'Error al guardar la simulacion' });
        }
    }

    private generarProyeccionMensual(
        saldoInicial: number,
        tasaInteresAnual: number,
        pagoBase: number,
        extraPayment: number,
        maxMeses: number
    ): Array<{ month: number; label: string; balanceWithout: number; balanceWith: number }> {
        const proyeccion: Array<{ month: number; label: string; balanceWithout: number; balanceWith: number }> = [];
        const tasaMensual = tasaInteresAnual / 12 / 100;
        
        let saldoSin = saldoInicial;
        let saldoCon = saldoInicial;
        const pagoConExtra = pagoBase + extraPayment;

        const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const hoy = new Date();
        const limite = Math.min(maxMeses, 360);

        for (let i = 0; i < limite; i++) {
            if (saldoSin <= 0 && saldoCon <= 0) break;

            const mesFecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
            const label = `${mesesNombres[mesFecha.getMonth()]} ${mesFecha.getFullYear().toString().slice(-2)}`;

            if (saldoSin > 0) {
                const interesSin = saldoSin * tasaMensual;
                const pagoEfectivoSin = Math.min(pagoBase, saldoSin + interesSin);
                saldoSin = saldoSin + interesSin - pagoEfectivoSin;
                if (saldoSin < 0.01) saldoSin = 0;
            }

            if (saldoCon > 0) {
                const interesCon = saldoCon * tasaMensual;
                const pagoEfectivoCon = Math.min(pagoConExtra, saldoCon + interesCon);
                saldoCon = saldoCon + interesCon - pagoEfectivoCon;
                if (saldoCon < 0.01) saldoCon = 0;
            }

            proyeccion.push({
                month: i + 1,
                label,
                balanceWithout: Math.round(saldoSin * 100) / 100,
                balanceWith: Math.round(saldoCon * 100) / 100
            });
        }

        return proyeccion;
    }

    async obtenerHistorial(req: Request, res: Response): Promise<void> {
    try {
        const usuarioId = req.user?.id;
        if (!usuarioId) {
            res.status(401).json({ success: false, message: 'No autorizado' });
            return;
        }

        const simulaciones = await this.simulacionRepo.find({
            where: { usuario: { id: usuarioId } },
            relations: { deuda: { acreedor: true } },
            order: { creado_en: 'DESC' }
        });

        res.status(200).json({ success: true, data: simulaciones });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ success: false, message: 'Error al obtener historial' });
    }
    }
   
    async eliminarSimulacion(req: Request, res: Response): Promise<void> {
    try {
        const usuarioId = req.user?.id;
        if (!usuarioId) {
            res.status(401).json({ success: false, message: 'No autorizado' });
            return;
        }

        const id = req.params.id as string;
        const resultado = await this.simulacionRepo.delete({ id, usuario: { id: usuarioId } });

        if (resultado.affected === 0) {
            res.status(404).json({ success: false, message: 'Simulación no encontrada' });
            return;
        }

        res.status(200).json({ success: true, message: 'Simulación eliminada' });
    } catch (error) {
        console.error('Error al eliminar simulación:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar simulación' });
    }
    }  
}