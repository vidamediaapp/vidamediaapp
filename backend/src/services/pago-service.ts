import { Repository } from 'typeorm';
import { Pago } from '../entities/pagos';
import { Deuda } from '../entities/deudas';

export class PagoService {
    constructor(
        private pagoRepository: Repository<Pago>,
        private deudaRepository: Repository<Deuda>
    ) {}

    async registrarPago(deudaId: string, monto: number, usuarioId: string): Promise<Pago> {
    const deuda = await this.deudaRepository.findOne({
        where: { id: deudaId, usuario: { id: usuarioId } }
    });

    if (!deuda) throw new Error('Deuda no encontrada o no pertenece al usuario');
    if (monto <= 0) throw new Error('El monto debe ser mayor a 0');
    if (monto > Number(deuda.saldo_pendiente)) throw new Error('El pago no puede superar el saldo pendiente');

    const pago = this.pagoRepository.create({
        deuda: { id: deudaId },
        monto: monto,
        fechaPago: new Date()
    });

    await this.pagoRepository.save(pago);

  
    deuda.saldo_pendiente = Math.max(0, Number(deuda.saldo_pendiente) - monto);

    const cuotaMensual = Number((deuda as any).cuotaMensual) || Number((deuda as any).cuota_mensual) || 0;
    if (cuotaMensual > 0 && monto >= cuotaMensual) {
    const cuotasCubiertas = Math.floor(monto / cuotaMensual);
    deuda.cuotasPagadas = (deuda.cuotasPagadas || 0) + cuotasCubiertas;
}
    
    if (Number(deuda.saldo_pendiente) <= 0) {
        deuda.saldo_pendiente = 0;
        deuda.estado = 'pagada';
    }

    await this.deudaRepository.save(deuda);

    return pago;
}

    async obtenerPagosDeuda(deudaId: string, usuarioId: string): Promise<Pago[]> {
        const deuda = await this.deudaRepository.findOne({
            where: { id: deudaId, usuario: { id: usuarioId } }
        });

        if (!deuda) {
            throw new Error('Deuda no encontrada');
        }

        return await this.pagoRepository.find({
            where: { deuda: { id: deudaId } },
            relations: { deuda: { acreedor: true } },
            order: { fechaPago: 'DESC' }  
        });
    }

    async obtenerTodosPagos(usuarioId: string): Promise<Pago[]> {
        return await this.pagoRepository.find({
            where: { deuda: { usuario: { id: usuarioId } } },
            relations: { deuda: { acreedor: true } },
            order: { fechaPago: 'DESC' }
        });
    }

  async eliminarPago(pagoId: string, deudaId: string, usuarioId: string): Promise<void> {
    const pago = await this.pagoRepository.findOne({
        where: { 
            id: pagoId,
            deuda: { id: deudaId, usuario: { id: usuarioId } } 
        },
        relations: { deuda: true }
    });

    if (!pago) throw new Error('Pago no encontrado');

    const montoPago = Number(pago.monto) || 0;
    const deuda = pago.deuda;
    const cuotaMensual = Number((deuda as any).cuotaMensual) || Number((deuda as any).cuota_mensual) || 0;

    deuda.saldo_pendiente = Number(deuda.saldo_pendiente) + montoPago;

    const cuotasCubiertas = cuotaMensual > 0 ? Math.floor(montoPago / cuotaMensual) : 0;


    if (cuotasCubiertas > 0 && (deuda.cuotasPagadas || 0) >= cuotasCubiertas) {
        deuda.cuotasPagadas = (deuda.cuotasPagadas || 0) - cuotasCubiertas;
    }

  
    if (Number(deuda.saldo_pendiente) > 0 && deuda.estado === 'pagada') {
        deuda.estado = 'pendiente';
    }

    await this.deudaRepository.save(deuda);
    await this.pagoRepository.remove(pago);
    }
}