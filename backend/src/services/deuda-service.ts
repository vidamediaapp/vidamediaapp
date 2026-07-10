import { Repository } from 'typeorm';
import { Deuda } from '../entities/deudas';

export class DeudaService {
    constructor(private deudaRepository: Repository<Deuda>) {}

    async obtenerDeudas(usuarioId: string): Promise<Deuda[]> {
        return await this.deudaRepository.find({
            where: { usuario: { id: usuarioId } },
            relations: { acreedor: true },
            order: { fecha_limite: 'ASC' }
        });
    }

    async obtenerDeudaPorId(id: string, usuarioId: string): Promise<Deuda | null> {
        return await this.deudaRepository.findOne({
            where: { id, usuario: { id: usuarioId } },
            relations: { acreedor: true, pagos: true }
        });
    }

    async crearDeuda(data: any, usuarioId: string): Promise<Deuda> {
        const { acreedorId, ...deudaData } = data;

        if (!deudaData.total_cuotas || deudaData.total_cuotas <= 0) {
            throw new Error('El total de cuotas es obligatorio y debe ser mayor a 0.');
        }

        const totalCuotas = deudaData.total_cuotas || 12;
        const cuotasPagadas = deudaData.cuotas_pagadas || 0;
        const cuotasRestantes = Math.max(1, totalCuotas - cuotasPagadas);
        const cuotaMensual = Math.ceil((deudaData.saldo_pendiente || 0) / cuotasRestantes);

        const deuda = this.deudaRepository.create({
            ...deudaData,
            totalCuotas,
            cuotasPagadas,
            cuotaMensual,
            usuario: { id: usuarioId },
            acreedor: { id: acreedorId }
        });

        const resultado = await this.deudaRepository.save(deuda) as unknown as Deuda;
        return resultado;
    }

    async actualizarDeuda(id: string, data: any, usuarioId: string): Promise<Deuda | null> {
        const deuda = await this.obtenerDeudaPorId(id, usuarioId);
        if (!deuda) return null;

        if (data.total_cuotas || data.cuotas_pagadas !== undefined || data.saldo_pendiente) {
            const totalCuotas = data.total_cuotas || deuda.totalCuotas;
            const cuotasPagadas = data.cuotas_pagadas !== undefined ? data.cuotas_pagadas : deuda.cuotasPagadas;
            const saldoPendiente = data.saldo_pendiente || deuda.saldo_pendiente;
            const cuotasRestantes = Math.max(1, totalCuotas - cuotasPagadas);
            data.cuotaMensual = Math.ceil(saldoPendiente / cuotasRestantes);
        }

        Object.assign(deuda, data);
        return await this.deudaRepository.save(deuda);
    }

    async eliminarDeuda(id: string, usuarioId: string): Promise<boolean> {
    const deuda = await this.deudaRepository.findOne({
        where: { id, usuario: { id: usuarioId } },
        relations: { simulaciones: true, pagos: true }
    });
    
    if (!deuda) return false;

  
    if (deuda.simulaciones?.length > 0) {
        await this.deudaRepository.manager.remove(deuda.simulaciones);
    }
    if (deuda.pagos?.length > 0) {
        await this.deudaRepository.manager.remove(deuda.pagos);
    }

    await this.deudaRepository.remove(deuda);
    return true;
}

    async actualizarSaldo(deudaId: string, montoPagado: number): Promise<void> {
        const deuda = await this.deudaRepository.findOne({ where: { id: deudaId } });
        if (!deuda) throw new Error('Deuda no encontrada');

        deuda.saldo_pendiente = Math.max(0, deuda.saldo_pendiente - montoPagado);
        deuda.cuotasPagadas = deuda.cuotasPagadas + 1;

        const cuotasRestantes = Math.max(1, deuda.totalCuotas - deuda.cuotasPagadas);
        deuda.cuotaMensual = Math.ceil(deuda.saldo_pendiente / cuotasRestantes);

        if (deuda.saldo_pendiente === 0) {
            deuda.estado = 'pagada';
        }
        await this.deudaRepository.save(deuda);
    }
}